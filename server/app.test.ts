import assert from 'node:assert/strict'
import type { AddressInfo } from 'node:net'
import test from 'node:test'
import { createApiApp } from './app.js'

test('server exposes health and safe tutor fallback without an API key', async () => {
  const previous = process.env.OPENAI_API_KEY
  delete process.env.OPENAI_API_KEY
  const app = createApiApp()
  const server = await new Promise<ReturnType<typeof app.listen>>((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance))
  })
  try {
    const port = (server.address() as AddressInfo).port
    const health = await fetch(`http://127.0.0.1:${port}/api/health`)
    assert.equal(health.status, 200)
    const healthBody = await health.json() as { ok:boolean; version:string; aiTutorConfigured:boolean; model:null|string }
    assert.equal(healthBody.ok, true)
    assert.equal(healthBody.aiTutorConfigured, false)
    assert.equal(healthBody.model, null)
    assert.match(healthBody.version, /^1\.0\.0-alpha/)

    const tutor = await fetch(`http://127.0.0.1:${port}/api/tutor`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'evaluate', challenge: { id: 'x' }, answer: 'my attempt' }),
    })
    assert.equal(tutor.status, 503)
    const tutorBody = await tutor.json() as { error:string }
    assert.match(tutorBody.error, /local rubric fallback/i)
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error: Error | undefined) => error ? reject(error) : resolve()))
    if (previous === undefined) delete process.env.OPENAI_API_KEY
    else process.env.OPENAI_API_KEY = previous
  }
})

import express, { type Request, type Response } from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApiApp } from './app.js'

const app = createApiApp()
const port = Number(process.env.PORT ?? 3000)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(root, 'dist')))
    app.use((_req: Request, res: Response) => res.sendFile(path.join(root, 'dist', 'index.html')))
  } else {
    const { createServer } = await import('vite')
    const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' })
    app.use(vite.middlewares)
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`SDE → FDE running on http://0.0.0.0:${port}`)
  })
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})

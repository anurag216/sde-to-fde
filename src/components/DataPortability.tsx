import { ChangeEvent, useRef, useState } from 'react'
import type { LearnerState } from '../domain'
import { parseLearnerStateBackup, serializeLearnerState } from '../lib/portability'
import './DataPortability.css'

export function DataPortability({ state, onImport }: { state: LearnerState; onImport: (state: LearnerState) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')

  function download() {
    const blob = new Blob([serializeLearnerState(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `sde-to-fde-progress-${new Date().toISOString().slice(0,10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('Backup exported. Keep it somewhere you control.')
  }

  async function restore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const next = parseLearnerStateBackup(await file.text())
      onImport(next)
      setMessage('Backup restored and saved locally.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not restore backup.')
    } finally {
      event.target.value = ''
    }
  }

  return <section className="card portability-card">
    <div><p className="eyebrow">YOUR LEARNING DATA</p><h2>Browser-local, but portable.</h2><p>The alpha stores progress locally. Export a JSON backup periodically so challenge evidence, reviews, XP and your roadmap inputs are not tied to one browser.</p></div>
    <div className="portability-actions"><button onClick={download}>Export progress</button><button className="ghost" onClick={() => inputRef.current?.click()}>Import backup</button><input ref={inputRef} hidden type="file" accept="application/json,.json" onChange={restore}/>{message&&<small>{message}</small>}</div>
  </section>
}

import assert from 'node:assert/strict'
import test from 'node:test'
import { validateCurriculum } from './catalogValidation'

test('curriculum catalog satisfies authoring invariants', () => {
  const errors = validateCurriculum()
  assert.deepEqual(errors, [], errors.join('\n'))
})

import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldShowWelcomeSequence } from '../src/utils/pageLoad.js'

test('shows the cinematic welcome sequence on every initial site entry', () => {
  assert.equal(shouldShowWelcomeSequence(), true)
})

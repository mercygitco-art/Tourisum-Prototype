import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldShowInitialLoader } from '../src/utils/pageLoad.js'

test('does not flash the loader after the document has loaded', () => {
  assert.equal(shouldShowInitialLoader('complete'), false)
})

test('shows the loader only while the document is still loading', () => {
  assert.equal(shouldShowInitialLoader('loading'), true)
  assert.equal(shouldShowInitialLoader('interactive'), true)
})

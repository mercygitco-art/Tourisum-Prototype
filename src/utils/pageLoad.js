export function shouldShowInitialLoader(readyState) {
  return readyState !== 'complete'
}

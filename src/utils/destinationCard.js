export function calculateCardTilt({ clientX, clientY, bounds }) {
  if (!bounds.width || !bounds.height) {
    return { rotateX: 0, rotateY: 0 }
  }

  const x = (clientX - bounds.left) / bounds.width - 0.5
  const y = (clientY - bounds.top) / bounds.height - 0.5
  const rotateX = y * -7
  const rotateY = x * 7

  return {
    rotateX: Object.is(rotateX, -0) ? 0 : rotateX,
    rotateY: Object.is(rotateY, -0) ? 0 : rotateY,
  }
}

export function shouldEnableCardTilt(pointerType, matchMedia) {
  if (pointerType !== 'mouse') return false
  return typeof matchMedia === 'function'
    ? !matchMedia('(prefers-reduced-motion: reduce)').matches
    : true
}

export function dispatchDestinationSelection(target, name) {
  if (!target?.dispatchEvent) return

  const detail = { name }
  let event

  if (typeof globalThis.CustomEvent === 'function') {
    event = new globalThis.CustomEvent('ceylon:select-destination', { detail })
  } else {
    event = { type: 'ceylon:select-destination', detail }
  }

  target.dispatchEvent(event)
}

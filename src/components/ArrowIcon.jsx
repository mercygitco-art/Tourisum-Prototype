function ArrowIcon({ diagonal = false }) {
  // Reusable decorative arrow that can point inline or diagonally on destination links.
  return (
    <svg
      aria-hidden="true"
      className={diagonal ? 'arrow-icon arrow-icon--diagonal' : 'arrow-icon'}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M4.5 12h14m-6-6 6 6-6 6" />
    </svg>
  )
}

export default ArrowIcon

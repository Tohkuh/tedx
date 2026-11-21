function ToghuBand({ variant = 'motif' }) {
  const className = variant === 'blue' ? 'toghu-blue' : variant === 'braid' ? 'toghu-braid' : 'toghu'
  return <div aria-hidden="true" className={className} />
}

export default ToghuBand
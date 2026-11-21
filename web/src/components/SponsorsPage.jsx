import { useEffect, useState } from 'react'
import SitePageFrame from './SitePageFrame.jsx'
import { getSponsorWall } from '../lib/api.js'

function readSponsors(payload) {
  const result = payload?.data ?? payload
  if (Array.isArray(result)) return result
  if (Array.isArray(result?.sponsors)) return result.sponsors
  if (Array.isArray(payload?.sponsors)) return payload.sponsors
  return []
}

function SponsorsPage() {
  const [sponsors, setSponsors] = useState([])
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    getSponsorWall()
      .then((payload) => {
        if (!active) return
        setSponsors(readSponsors(payload))
        setStatus('ready')
      })
      .catch((error) => {
        if (!active) return
        setMessage(error.message)
        setStatus('error')
      })
    return () => { active = false }
  }, [])

  return (
    <SitePageFrame>
      <section className="public-page-content sponsor-wall-page">
        <p className="event-meta">TEDx UNIVERSITY OF BAMENDA</p>
        <h1 className="section-title">Our sponsors</h1>
        <p className="public-page-intro">Thank you to everyone making it possible for more people to be in the room.</p>
        {status === 'loading' && <p className="public-status" role="status">Loading sponsors...</p>}
        {status === 'error' && <p className="public-status error" role="alert">{message}</p>}
        {status === 'ready' && sponsors.length === 0 && <p className="public-status">Sponsor names will appear here.</p>}
        {sponsors.length > 0 && (
          <div className="sponsor-wall-grid">
            {sponsors.map((sponsor, index) => (
              <article className="sponsor-wall-card" key={sponsor.id ?? `${sponsor.public_name ?? sponsor.name}-${index}`}>
                <span className="sponsor-wall-mark" aria-hidden="true">TEDx</span>
                <strong>{sponsor.public_name || sponsor.name || 'Anonymous sponsor'}</strong>
                <span>{sponsor.tickets_sponsored ?? sponsor.ticketsSponsored ?? sponsor.tickets_count ?? 0} tickets sponsored</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </SitePageFrame>
  )
}

export default SponsorsPage
import { useEffect, useState } from 'react'
import SitePageFrame from './SitePageFrame.jsx'
import { createReferral, getReferralLeaderboard } from '../lib/api.js'

function readRows(payload) {
  const result = payload?.data ?? payload
  if (Array.isArray(result)) return result
  if (Array.isArray(result?.leaderboard)) return result.leaderboard
  if (Array.isArray(result?.referrals)) return result.referrals
  return []
}

function ReferralsPage() {
  const [form, setForm] = useState({ name: '', email: '' })
  const [leaderboard, setLeaderboard] = useState([])
  const [message, setMessage] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    getReferralLeaderboard()
      .then((payload) => { if (active) setLeaderboard(readRows(payload)) })
      .catch((error) => { if (active) setMessage(error.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function submitReferral(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setCreatedCode('')
    try {
      const payload = await createReferral(form)
      const result = payload?.data ?? payload
      setCreatedCode(result?.code || result?.referral_code || '')
      setMessage(result?.message || 'Your referral code is ready.')
      setForm({ name: '', email: '' })
      const updated = await getReferralLeaderboard()
      setLeaderboard(readRows(updated))
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SitePageFrame>
      <section className="public-page-content referrals-page">
        <p className="event-meta">PASS IT ON</p>
        <h1 className="section-title">Refer a friend</h1>
        <p className="public-page-intro">Create your referral code and help more people join us beyond the applause.</p>
        <div className="referrals-layout">
          <form className="referral-form" onSubmit={submitReferral}>
            <h2 className="public-subtitle">Get your code</h2>
            <label htmlFor="referral-name">Full name</label>
            <input id="referral-name" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <label htmlFor="referral-email">Email</label>
            <input id="referral-email" autoComplete="email" required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            <button className="btn btn-primary" disabled={submitting} type="submit">{submitting ? 'Creating code...' : 'Create referral code'}</button>
            <p className="public-status" aria-live="polite">{message}</p>
            {createdCode && <output className="referral-code">{createdCode}</output>}
          </form>
          <section className="leaderboard" aria-labelledby="leaderboard-title">
            <h2 className="public-subtitle" id="leaderboard-title">Leaderboard</h2>
            {loading && <p className="public-status" role="status">Loading leaderboard...</p>}
            {!loading && leaderboard.length === 0 && <p className="public-status">No referrals yet.</p>}
            {leaderboard.length > 0 && (
              <ol className="leaderboard-list">
                {leaderboard.map((row, index) => (
                  <li key={row.id ?? row.code ?? `${row.name}-${index}`}>
                    <span className="leaderboard-rank">{index + 1}</span>
                    <strong>{row.public_name || row.name || row.referrer_name || 'TEDx friend'}</strong>
                    <span>{row.referrals_count ?? row.tickets_referred ?? row.count ?? 0}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </section>
    </SitePageFrame>
  )
}

export default ReferralsPage
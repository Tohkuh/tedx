import { useEffect, useState } from 'react'
import {
  adminLogin,
  clearAdminToken,
  createAdminSpeaker,
  createAdminTicketType,
  deleteAdminSpeaker,
  deleteAdminTicketType,
  getAdminAttendees,
  getAdminOrders,
  getAdminOverview,
  getAdminReferrals,
  getAdminSettings,
  getAdminSponsors,
  getAdminSpeakers,
  getAdminTicketTypes,
  hasAdminSession,
  updateAdminSettings,
  updateAdminSpeaker,
  updateAdminTicketType,
  updateAttendeeCheckIn,
} from '../lib/api.js'

const tabs = ['Overview', 'Ticket types', 'Orders and payments', 'Attendees', 'Sponsors', 'Referrals leaderboard', 'Speakers', 'Settings']

function valueOf(object, ...keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object[key] !== null) return object[key]
  }
  return undefined
}

function unwrap(payload) {
  let result = payload
  while (result && !Array.isArray(result) && result.data !== undefined) result = result.data
  return result
}

function rowsOf(payload, ...keys) {
  const result = unwrap(payload)
  if (Array.isArray(result)) return result
  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key]
  }
  return []
}

function display(value) {
  if (value === undefined || value === null || value === '') return '—'
  return String(value)
}

function formatXaf(amount) {
  const numeric = Number(amount)
  if (!Number.isFinite(numeric)) return '—'
  return `${numeric.toLocaleString()} XAF`
}

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(hasAdminSession)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  async function submitLogin(event) {
    event.preventDefault()
    setLoggingIn(true)
    setLoginError('')
    try {
      await adminLogin(credentials)
      setAuthenticated(true)
    } catch (error) {
      setLoginError(error.message)
    } finally {
      setLoggingIn(false)
    }
  }

  function signOut() {
    clearAdminToken()
    setAuthenticated(false)
    setCredentials({ email: '', password: '' })
  }

  if (!authenticated) {
    return (
      <main className="admin-shell admin-login-shell">
        <a className="brand" href="/"><span className="brand-mark">TEDx</span> University of Bamenda</a>
        <form className="admin-login-form" onSubmit={submitLogin}>
          <p className="event-meta">ADMINISTRATION</p>
          <h1 className="section-title">Sign in</h1>
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" autoComplete="username" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" autoComplete="current-password" required value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} />
          {loginError && <p className="admin-message error" role="alert">{loginError}</p>}
          <button className="btn btn-primary" disabled={loggingIn} type="submit">{loggingIn ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </main>
    )
  }

  return <AdminDashboard onSignOut={signOut} />
}

function AdminDashboard({ onSignOut }) {
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [attendeeSearch, setAttendeeSearch] = useState('')
  const [ticketForm, setTicketForm] = useState({ name: '', price: '', active: true })
  const [ticketEditId, setTicketEditId] = useState(null)
  const [speakerForm, setSpeakerForm] = useState({ name: '', talk_title: '', active: true })
  const [speakerEditId, setSpeakerEditId] = useState(null)
  const [maxAttendees, setMaxAttendees] = useState('')
  const [salesOpen, setSalesOpen] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        let result
        switch (activeTab) {
          case 'Overview': {
            const [overview, settings] = await Promise.all([getAdminOverview(), getAdminSettings()])
            result = { ...((unwrap(overview) && typeof unwrap(overview) === 'object') ? unwrap(overview) : {}), settings: unwrap(settings) || {} }
            break
          }
          case 'Ticket types': result = await getAdminTicketTypes(); break
          case 'Orders and payments': result = await getAdminOrders(); break
          case 'Attendees': result = await getAdminAttendees(attendeeSearch); break
          case 'Sponsors': result = await getAdminSponsors(); break
          case 'Referrals leaderboard': result = await getAdminReferrals(); break
          case 'Speakers': result = await getAdminSpeakers(); break
          case 'Settings': result = await getAdminSettings(); break
          default: result = null
        }
        if (active) {
          setData(result)
          const settings = activeTab === 'Settings' ? unwrap(result) : result?.settings
          if (settings) {
            setSalesOpen(Boolean(valueOf(settings, 'sales_open', 'salesOpen') ?? true))
            setMaxAttendees(valueOf(settings, 'max_attendees', 'maxAttendees') ?? '')
          }
        }
      } catch (loadError) {
        if (active) setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [activeTab, attendeeSearch, refreshKey])

  async function perform(action, successMessage) {
    setError('')
    setNotice('')
    try {
      await action()
      setNotice(successMessage)
      setRefreshKey((key) => key + 1)
      return true
    } catch (actionError) {
      setError(actionError.message)
      return false
    }
  }

  async function saveTicketType(event) {
    event.preventDefault()
    const saved = await perform(
      () => ticketEditId
        ? updateAdminTicketType(ticketEditId, { ...ticketForm, price: Number(ticketForm.price) })
        : createAdminTicketType({ ...ticketForm, price: Number(ticketForm.price) }),
      'Ticket type saved.',
    )
    if (saved) {
      setTicketForm({ name: '', price: '', active: true })
      setTicketEditId(null)
    }
  }

  async function saveSpeaker(event) {
    event.preventDefault()
    const saved = await perform(
      () => speakerEditId ? updateAdminSpeaker(speakerEditId, speakerForm) : createAdminSpeaker(speakerForm),
      'Speaker saved.',
    )
    if (saved) {
      setSpeakerForm({ name: '', talk_title: '', active: true })
      setSpeakerEditId(null)
    }
  }

  async function toggleSales() {
    const next = !salesOpen
    const saved = await perform(() => updateAdminSettings({ sales_open: next }), next ? 'Ticket sales opened.' : 'Ticket sales closed.')
    if (saved) setSalesOpen(next)
  }

  async function saveSettings(event) {
    event.preventDefault()
    await perform(() => updateAdminSettings({ sales_open: salesOpen, max_attendees: maxAttendees === '' ? null : Number(maxAttendees) }), 'Settings saved.')
  }

  function editTicketType(ticketType) {
    setTicketEditId(ticketType.id)
    setTicketForm({ name: ticketType.name || '', price: String(ticketType.price ?? ''), active: Boolean(ticketType.active) })
  }

  function editSpeaker(speaker) {
    setSpeakerEditId(speaker.id)
    setSpeakerForm({ name: speaker.name || '', talk_title: speaker.talk_title || speaker.talk || '', active: Boolean(speaker.active) })
  }

  function renderOverview() {
    const overview = unwrap(data) || {}
    const open = Boolean(valueOf(overview.settings, 'sales_open', 'salesOpen') ?? valueOf(overview, 'sales_open', 'salesOpen') ?? salesOpen)
    const stats = [
      ['Tickets sold', valueOf(overview, 'tickets_sold', 'ticketsSold') ?? 0],
      ['Revenue', formatXaf(valueOf(overview, 'revenue', 'total_revenue'))],
      ['Redeemed codes', valueOf(overview, 'redeemed_codes', 'redeemedCodes') ?? 0],
    ]
    return (
      <>
        <div className="admin-stats-grid">
          {stats.map(([label, amount]) => <article className="admin-stat" key={label}><span>{label}</span><strong>{amount}</strong></article>)}
        </div>
        <div className="admin-action-row">
          <div><strong>Ticket sales</strong><span className={`admin-state ${open ? 'is-open' : 'is-closed'}`}>{open ? 'Open' : 'Closed'}</span></div>
          <button className="btn" type="button" onClick={toggleSales}>{open ? 'Close sales' : 'Open sales'}</button>
        </div>
      </>
    )
  }

  function renderTicketTypes() {
    const ticketTypes = rowsOf(data, 'ticket_types', 'ticketTypes')
    return (
      <>
        <form className="admin-inline-form" onSubmit={saveTicketType}>
          <h3>{ticketEditId ? 'Edit ticket type' : 'Create ticket type'}</h3>
          <label>Name<input required value={ticketForm.name} onChange={(event) => setTicketForm({ ...ticketForm, name: event.target.value })} /></label>
          <label>Price (XAF)<input required min="0" step="1" type="number" value={ticketForm.price} onChange={(event) => setTicketForm({ ...ticketForm, price: event.target.value })} /></label>
          <label className="admin-check"><input checked={ticketForm.active} type="checkbox" onChange={(event) => setTicketForm({ ...ticketForm, active: event.target.checked })} />Active</label>
          <button className="btn btn-primary" type="submit">{ticketEditId ? 'Save changes' : 'Create type'}</button>
          {ticketEditId && <button className="btn" type="button" onClick={() => { setTicketEditId(null); setTicketForm({ name: '', price: '', active: true }) }}>Cancel</button>}
        </form>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {ticketTypes.map((row) => <tr key={row.id}><td>{display(row.name)}</td><td>{formatXaf(row.price)}</td><td>{row.active ? 'Active' : 'Inactive'}</td><td className="admin-row-actions"><button className="text-button" type="button" onClick={() => editTicketType(row)}>Edit</button><button className="text-button danger" type="button" onClick={() => perform(() => deleteAdminTicketType(row.id), 'Ticket type deleted.')}>Delete</button></td></tr>)}
          {ticketTypes.length === 0 && <tr><td colSpan="4">No ticket types found.</td></tr>}
        </tbody></table></div>
      </>
    )
  }

  function renderOrders() {
    const orders = rowsOf(data, 'orders', 'payments')
    return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Date</th></tr></thead><tbody>
      {orders.map((row) => <tr key={row.id}><td>{display(row.reference || row.order_number || row.id)}</td><td>{display(row.name || row.customer_name || row.email)}</td><td>{formatXaf(row.amount ?? row.total)}</td><td>{display(row.payment?.status || row.payment_status || row.status)}</td><td>{display(row.created_at || row.createdAt)}</td></tr>)}
      {orders.length === 0 && <tr><td colSpan="5">No orders or payments found.</td></tr>}
    </tbody></table></div>
  }

  function renderAttendees() {
    const attendees = rowsOf(data, 'attendees')
    return <>
      <form className="admin-search" onSubmit={(event) => { event.preventDefault(); setRefreshKey((key) => key + 1) }}>
        <label htmlFor="attendee-search">Search attendees</label><input id="attendee-search" value={attendeeSearch} onChange={(event) => setAttendeeSearch(event.target.value)} placeholder="Name or email" />
        <button className="btn" type="submit">Search</button>
      </form>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Ticket</th><th>Check-in</th><th>Action</th></tr></thead><tbody>
        {attendees.map((row) => { const checkedIn = Boolean(row.checked_in ?? row.checkedIn ?? row.checked_in_at); return <tr key={row.id}><td>{display(row.name)}</td><td>{display(row.email)}</td><td>{display(row.ticket_type?.name || row.ticket_type || row.ticketType)}</td><td>{checkedIn ? 'Checked in' : 'Not checked in'}</td><td><button className="text-button" type="button" onClick={() => perform(() => updateAttendeeCheckIn(row.id, !checkedIn), checkedIn ? 'Attendee check-in reversed.' : 'Attendee checked in.')}>{checkedIn ? 'Undo check-in' : 'Check in'}</button></td></tr> })}
        {attendees.length === 0 && <tr><td colSpan="5">No attendees found.</td></tr>}
      </tbody></table></div>
    </>
  }

  function renderSponsors() {
    const sponsors = rowsOf(data, 'sponsors')
    return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Sponsor</th><th>Tickets bought</th><th>Codes</th><th>Redeemed</th></tr></thead><tbody>
      {sponsors.map((row) => { const codes = row.codes || row.sponsored_codes || []; const redeemed = codes.filter((code) => code.redeemed || code.redeemed_at || code.status === 'redeemed').length; return <tr key={row.id}><td>{display(row.public_name || row.name)}</td><td>{display(row.tickets_bought ?? row.tickets_count ?? row.quantity)}</td><td><div className="admin-code-list">{codes.length ? codes.map((code, index) => { const used = Boolean(code.redeemed || code.redeemed_at || code.status === 'redeemed'); return <span key={code.id ?? code.code ?? index}>{typeof code === 'string' ? code : display(code.code || code.code_value)} <small>{used ? 'Redeemed' : 'Available'}</small></span> }) : '—'}</div></td><td>{redeemed} / {codes.length}</td></tr> })}
      {sponsors.length === 0 && <tr><td colSpan="4">No sponsors found.</td></tr>}
    </tbody></table></div>
  }

  function renderReferrals() {
    const referrals = rowsOf(data, 'leaderboard', 'referrals')
    return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Rank</th><th>Name</th><th>Code</th><th>Referrals</th></tr></thead><tbody>
      {referrals.map((row, index) => <tr key={row.id ?? row.code ?? index}><td>{index + 1}</td><td>{display(row.name || row.public_name)}</td><td>{display(row.code || row.referral_code)}</td><td>{display(row.referrals_count ?? row.tickets_referred ?? row.count ?? 0)}</td></tr>)}
      {referrals.length === 0 && <tr><td colSpan="4">No referral activity found.</td></tr>}
    </tbody></table></div>
  }

  function renderSpeakers() {
    const speakers = rowsOf(data, 'speakers')
    return <>
      <form className="admin-inline-form" onSubmit={saveSpeaker}>
        <h3>{speakerEditId ? 'Edit speaker' : 'Add speaker'}</h3>
        <label>Name<input required value={speakerForm.name} onChange={(event) => setSpeakerForm({ ...speakerForm, name: event.target.value })} /></label>
        <label>Talk title<input required value={speakerForm.talk_title} onChange={(event) => setSpeakerForm({ ...speakerForm, talk_title: event.target.value })} /></label>
        <label className="admin-check"><input checked={speakerForm.active} type="checkbox" onChange={(event) => setSpeakerForm({ ...speakerForm, active: event.target.checked })} />Active</label>
        <button className="btn btn-primary" type="submit">{speakerEditId ? 'Save changes' : 'Add speaker'}</button>
        {speakerEditId && <button className="btn" type="button" onClick={() => { setSpeakerEditId(null); setSpeakerForm({ name: '', talk_title: '', active: true }) }}>Cancel</button>}
      </form>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Talk</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {speakers.map((row) => <tr key={row.id}><td>{display(row.name)}</td><td>{display(row.talk_title || row.talk)}</td><td>{row.active ? 'Active' : 'Inactive'}</td><td className="admin-row-actions"><button className="text-button" type="button" onClick={() => editSpeaker(row)}>Edit</button><button className="text-button danger" type="button" onClick={() => perform(() => deleteAdminSpeaker(row.id), 'Speaker deleted.')}>Delete</button></td></tr>)}
        {speakers.length === 0 && <tr><td colSpan="4">No speakers found.</td></tr>}
      </tbody></table></div>
    </>
  }

  function renderSettings() {
    return <form className="admin-settings-form" onSubmit={saveSettings}>
      <label className="admin-check"><input checked={salesOpen} type="checkbox" onChange={(event) => setSalesOpen(event.target.checked)} />Ticket sales open</label>
      <label>Maximum attendees <span className="field-note">Optional</span><input min="1" type="number" value={maxAttendees} onChange={(event) => setMaxAttendees(event.target.value)} placeholder="No limit" /></label>
      <button className="btn btn-primary" type="submit">Save settings</button>
    </form>
  }

  function contentForTab() {
    if (loading) return <p className="admin-message" role="status">Loading {activeTab.toLowerCase()}...</p>
    switch (activeTab) {
      case 'Overview': return renderOverview()
      case 'Ticket types': return renderTicketTypes()
      case 'Orders and payments': return renderOrders()
      case 'Attendees': return renderAttendees()
      case 'Sponsors': return renderSponsors()
      case 'Referrals leaderboard': return renderReferrals()
      case 'Speakers': return renderSpeakers()
      case 'Settings': return renderSettings()
      default: return null
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <a className="brand" href="/"><span className="brand-mark">TEDx</span> Admin</a>
        <button className="btn" type="button" onClick={onSignOut}>Sign out</button>
      </header>
      <div className="admin-layout">
        <nav className="admin-tabs" aria-label="Admin sections" role="tablist">
          {tabs.map((tab) => <button aria-selected={activeTab === tab} className={activeTab === tab ? 'is-active' : ''} key={tab} onClick={() => setActiveTab(tab)} role="tab" type="button">{tab}</button>)}
        </nav>
        <section className="admin-panel" aria-labelledby="admin-panel-title">
          <div className="admin-panel-heading"><div><p className="event-meta">EVENT CONTROL</p><h1 className="section-title" id="admin-panel-title">{activeTab}</h1></div><button className="text-button" type="button" onClick={() => setRefreshKey((key) => key + 1)}>Refresh</button></div>
          {error && <p className="admin-message error" role="alert">{error}</p>}
          {notice && <p className="admin-message" role="status">{notice}</p>}
          {contentForTab()}
        </section>
      </div>
    </main>
  )
}

export default AdminPage
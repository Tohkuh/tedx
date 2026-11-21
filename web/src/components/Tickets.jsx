import { useEffect, useState } from 'react'
import { createSponsorshipCheckout, createTicketCheckout, getEvent, redeemCode } from '../lib/api.js'

const initialContact = { name: '', email: '' }

function readEvent(payload) {
  let result = payload?.data ?? payload
  if (result?.event) result = result.event
  return result || {}
}

function readTicketTypes(eventInfo) {
  const types = eventInfo.ticket_types || eventInfo.ticketTypes || eventInfo.types || []
  return Array.isArray(types) ? types : []
}

function formatXaf(price) {
  const amount = Number(price)
  return Number.isFinite(amount) ? `${amount.toLocaleString()} XAF` : '— XAF'
}

function responseMessage(payload, fallback) {
  return payload?.message || payload?.data?.message || fallback
}

function Tickets() {
  const [eventInfo, setEventInfo] = useState(null)
  const [ticketTypes, setTicketTypes] = useState([])
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [eventError, setEventError] = useState('')
  const [ticket, setTicket] = useState({ ...initialContact, ticketTypeId: '', referralCode: '' })
  const [sponsorship, setSponsorship] = useState({ ...initialContact, ticketTypeId: '', quantity: '1', showPublicName: false, publicName: '' })
  const [redemption, setRedemption] = useState({ ...initialContact, code: '' })
  const [messages, setMessages] = useState({ ticket: '', sponsorship: '', redemption: '' })
  const [submitting, setSubmitting] = useState({ ticket: false, sponsorship: false, redemption: false })

  useEffect(() => {
    let active = true
    getEvent()
      .then((payload) => {
        if (!active) return
        const eventData = readEvent(payload)
        const types = readTicketTypes(eventData)
        setEventInfo(eventData)
        setTicketTypes(types)
        const firstId = types[0]?.id ?? ''
        setTicket((current) => ({ ...current, ticketTypeId: String(firstId) }))
        setSponsorship((current) => ({ ...current, ticketTypeId: String(firstId) }))
      })
      .catch((error) => { if (active) setEventError(error.message) })
      .finally(() => { if (active) setLoadingEvent(false) })
    return () => { active = false }
  }, [])

  const selectedTicket = ticketTypes.find((type) => String(type.id) === String(ticket.ticketTypeId))
  const selectedSponsorTicket = ticketTypes.find((type) => String(type.id) === String(sponsorship.ticketTypeId))
  const isSalesOpen = eventInfo?.sales_open ?? eventInfo?.salesOpen ?? eventInfo?.ticket_sales_open ?? eventInfo?.ticketSalesOpen ?? true
  const salesClosed = isSalesOpen === false || isSalesOpen === 0

  async function submitForm(event, key, action, values, fallback) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setMessages((current) => ({ ...current, [key]: 'Enter a valid email address.' }))
      return
    }
    setSubmitting((current) => ({ ...current, [key]: true }))
    setMessages((current) => ({ ...current, [key]: '' }))
    try {
      const result = await action(values)
      setMessages((current) => ({ ...current, [key]: responseMessage(result, fallback) }))
    } catch (error) {
      const alreadyUsed = key === 'redemption' && (error.status === 409 || /already (used|redeemed)|has been redeemed/i.test(error.message))
      setMessages((current) => ({ ...current, [key]: alreadyUsed ? 'This sponsored code has already been used.' : error.message }))
    } finally {
      setSubmitting((current) => ({ ...current, [key]: false }))
    }
  }

  return (
    <section className="tickets-section" id="tickets">
      <h2 className="tickets-title">Tickets</h2>
      <p className="tickets-intro">No account needed. Your digital ticket with a QR code arrives by email.</p>
      {salesClosed && <p className="sales-closed" role="status">Ticket sales are closed.</p>}
      {eventError && <p className="form-message event-error" role="alert">{eventError}</p>}
      <div className="tickets-grid">
        <form className="ticket-card" onSubmit={(event) => submitForm(event, 'ticket', createTicketCheckout, {
          ticket_type_id: Number(ticket.ticketTypeId),
          name: ticket.name,
          email: ticket.email,
          referral_code: ticket.referralCode.trim() || undefined,
        }, 'Checkout request received.')}>
          <strong className="ticket-card-title">General ticket</strong>
          <span className="ticket-price">{selectedTicket ? formatXaf(selectedTicket.price) : loadingEvent ? 'Loading...' : '— XAF'}</span>
          <label htmlFor="ticket-type">Ticket type</label>
          <select id="ticket-type" disabled={loadingEvent || ticketTypes.length === 0} onChange={(event) => setTicket({ ...ticket, ticketTypeId: event.target.value })} required value={ticket.ticketTypeId}>
            <option value="" disabled>Select a ticket type</option>
            {ticketTypes.map((type) => <option key={type.id} value={type.id}>{type.name} · {formatXaf(type.price)}</option>)}
          </select>
          <label htmlFor="ticket-name">Full name</label>
          <input autoComplete="name" id="ticket-name" onChange={(event) => setTicket({ ...ticket, name: event.target.value })} required type="text" value={ticket.name} />
          <label htmlFor="ticket-email">Email</label>
          <input autoComplete="email" id="ticket-email" onChange={(event) => setTicket({ ...ticket, email: event.target.value })} required type="email" value={ticket.email} />
          <label htmlFor="ticket-referral">Referral code <span className="field-note">Optional</span></label>
          <input id="ticket-referral" onChange={(event) => setTicket({ ...ticket, referralCode: event.target.value })} type="text" value={ticket.referralCode} />
          <button className="btn btn-primary" disabled={salesClosed || loadingEvent || !selectedTicket || submitting.ticket} type="submit">{submitting.ticket ? 'Submitting...' : 'Pay and get ticket'}</button>
          <p aria-live="polite" className="form-message">{messages.ticket}</p>
        </form>

        <form className="ticket-card" onSubmit={(event) => submitForm(event, 'sponsorship', createSponsorshipCheckout, {
          ticket_type_id: Number(sponsorship.ticketTypeId),
          quantity: Number(sponsorship.quantity),
          name: sponsorship.name,
          email: sponsorship.email,
          show_public_name: sponsorship.showPublicName,
          public_name: sponsorship.showPublicName ? sponsorship.publicName.trim() || undefined : undefined,
        }, 'Sponsorship checkout request received.')}>
          <strong className="ticket-card-title">Sponsor tickets</strong>
          <span className="ticket-description">Pay for any number of tickets. After payment is confirmed you receive unique codes to share.</span>
          <label htmlFor="sponsor-ticket-type">Ticket type</label>
          <select id="sponsor-ticket-type" disabled={loadingEvent || ticketTypes.length === 0} onChange={(event) => setSponsorship({ ...sponsorship, ticketTypeId: event.target.value })} required value={sponsorship.ticketTypeId}>
            <option value="" disabled>Select a ticket type</option>
            {ticketTypes.map((type) => <option key={type.id} value={type.id}>{type.name} · {formatXaf(type.price)}</option>)}
          </select>
          <label htmlFor="sponsor-quantity">Number of tickets</label>
          <input id="sponsor-quantity" max="999" min="1" onChange={(event) => setSponsorship({ ...sponsorship, quantity: event.target.value })} required type="number" value={sponsorship.quantity} />
          <label htmlFor="sponsor-name">Full name</label>
          <input autoComplete="name" id="sponsor-name" onChange={(event) => setSponsorship({ ...sponsorship, name: event.target.value })} required type="text" value={sponsorship.name} />
          <label htmlFor="sponsor-email">Email</label>
          <input autoComplete="email" id="sponsor-email" onChange={(event) => setSponsorship({ ...sponsorship, email: event.target.value })} required type="email" value={sponsorship.email} />
          <label className="ticket-checkbox" htmlFor="sponsor-public-name"><input checked={sponsorship.showPublicName} id="sponsor-public-name" onChange={(event) => setSponsorship({ ...sponsorship, showPublicName: event.target.checked })} type="checkbox" />Show my name on the sponsors page</label>
          {sponsorship.showPublicName && <><label htmlFor="sponsor-public-name-value">Public name <span className="field-note">Optional</span></label><input id="sponsor-public-name-value" onChange={(event) => setSponsorship({ ...sponsorship, publicName: event.target.value })} type="text" value={sponsorship.publicName} /></>}
          <strong className="sponsor-total">Total: {selectedSponsorTicket ? formatXaf(Number(selectedSponsorTicket.price) * (Number(sponsorship.quantity) || 0)) : '— XAF'}</strong>
          <button className="btn" disabled={salesClosed || loadingEvent || !selectedSponsorTicket || submitting.sponsorship} type="submit">{submitting.sponsorship ? 'Submitting...' : 'Sponsor tickets'}</button>
          <p aria-live="polite" className="form-message">{messages.sponsorship}</p>
        </form>

        <form className="ticket-card" onSubmit={(event) => submitForm(event, 'redemption', redeemCode, redemption, 'Your sponsored ticket is ready.')}>
          <strong className="ticket-card-title">Have a sponsored code?</strong>
          <span className="ticket-description">Enter your code and details to receive your ticket. Each code works once.</span>
          <label htmlFor="redemption-code">Redemption code</label>
          <input id="redemption-code" onChange={(event) => setRedemption({ ...redemption, code: event.target.value })} required type="text" value={redemption.code} />
          <label htmlFor="redemption-name">Full name</label>
          <input autoComplete="name" id="redemption-name" onChange={(event) => setRedemption({ ...redemption, name: event.target.value })} required type="text" value={redemption.name} />
          <label htmlFor="redemption-email">Email</label>
          <input autoComplete="email" id="redemption-email" onChange={(event) => setRedemption({ ...redemption, email: event.target.value })} required type="email" value={redemption.email} />
          <button className="btn" disabled={submitting.redemption} type="submit">{submitting.redemption ? 'Redeeming...' : 'Redeem'}</button>
          <p aria-live="polite" className="form-message">{messages.redemption}</p>
        </form>
      </div>
    </section>
  )
}

export default Tickets
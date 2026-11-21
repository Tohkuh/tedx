import { useState } from 'react'
import { ticketPrice } from '../data/content.js'
import { createSponsorshipCheckout, createTicketCheckout, redeemCode } from '../lib/api.js'

const initialContact = { name: '', email: '' }

function Tickets() {
  const [ticket, setTicket] = useState({ ...initialContact, quantity: '1' })
  const [sponsorship, setSponsorship] = useState({ ...initialContact, quantity: '1' })
  const [redemption, setRedemption] = useState({ ...initialContact, code: '' })
  const [messages, setMessages] = useState({ ticket: '', sponsorship: '', redemption: '' })

  async function submitForm(event, key, action, values) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setMessages((current) => ({ ...current, [key]: 'Enter a valid email address.' }))
      return
    }
    setMessages((current) => ({ ...current, [key]: 'Preparing your request...' }))
    const result = await action(values)
    setMessages((current) => ({ ...current, [key]: result.message }))
  }

  return (
    <section className="tickets-section" id="tickets">
      <h2 className="tickets-title">Tickets</h2>
      <p className="tickets-intro">No account needed. Your digital ticket with a QR code arrives by email.</p>
      <div className="tickets-grid">
        <form className="ticket-card" onSubmit={(event) => submitForm(event, 'ticket', createTicketCheckout, ticket)}>
          <strong className="ticket-card-title">General ticket</strong>
          <span className="ticket-price">{ticketPrice}</span>
          <label htmlFor="ticket-name">Full name</label>
          <input autoComplete="name" id="ticket-name" onChange={(event) => setTicket({ ...ticket, name: event.target.value })} required type="text" value={ticket.name} />
          <label htmlFor="ticket-email">Email</label>
          <input autoComplete="email" id="ticket-email" onChange={(event) => setTicket({ ...ticket, email: event.target.value })} required type="email" value={ticket.email} />
          <label htmlFor="ticket-quantity">Number of tickets</label>
          <input id="ticket-quantity" min="1" onChange={(event) => setTicket({ ...ticket, quantity: event.target.value })} required type="number" value={ticket.quantity} />
          <button className="btn btn-primary" type="submit">Pay and get ticket</button>
          <p aria-live="polite" className="form-message">{messages.ticket}</p>
        </form>

        <form className="ticket-card" onSubmit={(event) => submitForm(event, 'sponsorship', createSponsorshipCheckout, sponsorship)}>
          <strong className="ticket-card-title">Sponsor tickets</strong>
          <span className="ticket-description">Pay for any number of tickets. After payment is confirmed you receive unique codes to share.</span>
          <label htmlFor="sponsor-quantity">Number of tickets</label>
          <input id="sponsor-quantity" min="1" onChange={(event) => setSponsorship({ ...sponsorship, quantity: event.target.value })} required type="number" value={sponsorship.quantity} />
          <label htmlFor="sponsor-name">Full name</label>
          <input autoComplete="name" id="sponsor-name" onChange={(event) => setSponsorship({ ...sponsorship, name: event.target.value })} required type="text" value={sponsorship.name} />
          <label htmlFor="sponsor-email">Email</label>
          <input autoComplete="email" id="sponsor-email" onChange={(event) => setSponsorship({ ...sponsorship, email: event.target.value })} required type="email" value={sponsorship.email} />
          <button className="btn" type="submit">Sponsor tickets</button>
          <p aria-live="polite" className="form-message">{messages.sponsorship}</p>
        </form>

        <form className="ticket-card" onSubmit={(event) => submitForm(event, 'redemption', redeemCode, redemption)}>
          <strong className="ticket-card-title">Have a sponsored code?</strong>
          <span className="ticket-description">Enter your code and details to receive your ticket. Each code works once.</span>
          <label htmlFor="redemption-code">Redemption code</label>
          <input id="redemption-code" onChange={(event) => setRedemption({ ...redemption, code: event.target.value })} required type="text" value={redemption.code} />
          <label htmlFor="redemption-name">Full name</label>
          <input autoComplete="name" id="redemption-name" onChange={(event) => setRedemption({ ...redemption, name: event.target.value })} required type="text" value={redemption.name} />
          <label htmlFor="redemption-email">Email</label>
          <input autoComplete="email" id="redemption-email" onChange={(event) => setRedemption({ ...redemption, email: event.target.value })} required type="email" value={redemption.email} />
          <button className="btn" type="submit">Redeem</button>
          <p aria-live="polite" className="form-message">{messages.redemption}</p>
        </form>
      </div>
    </section>
  )
}

export default Tickets
import { event } from '../data/content.js'

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="hero-layout" id="top">
      <div className="hero-copy">
        <div className="event-meta">{event.date} · {event.venue}, {event.city}</div>
        <h1 className="hero-title font-display" id="hero-title">Beyond the <span className="gold-text">Applause</span></h1>
        <p className="hero-description">Ideas worth spreading from the Grassfields. A day of talks, performance and conversation about what remains when the clapping stops.</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#tickets">Buy a ticket</a>
          <a className="btn" href="#tickets">Sponsor a ticket</a>
        </div>
      </div>
      <div aria-hidden="true" className="hero-art"><div className="toghu-panel" /></div>
    </section>
  )
}

export default Hero
import { sponsors } from '../data/content.js'

function SponsorsPartners() {
  return (
    <section className="sponsors-section" id="sponsors">
      <h2 className="section-title">Sponsors &amp; partners</h2>
      <div className="sponsors-grid">
        {sponsors.map((sponsor, index) => <div className="sponsor-placeholder" key={`${sponsor.name}-${index}`}>{sponsor.name}</div>)}
      </div>
    </section>
  )
}

export default SponsorsPartners
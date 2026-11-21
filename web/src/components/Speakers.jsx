import { speakers } from '../data/content.js'

function Speakers() {
  return (
    <section className="speakers-section" id="speakers">
      <h2 className="section-title">Speakers</h2>
      <div className="speakers-grid">
        {speakers.map((speaker, index) => (
          <article className="speaker-card" key={`${speaker.name}-${index}`}>
            <div aria-hidden="true" className={`speaker-diamond speaker-diamond-${speaker.color}`} />
            <strong className="speaker-name">{speaker.name}</strong>
            <span className="speaker-talk">{speaker.talk}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Speakers
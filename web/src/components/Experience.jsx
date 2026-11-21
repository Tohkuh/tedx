const experiences = [
  ['Talks', '[Session format and timing]'],
  ['Performances', '[Music, dance, craft]'],
  ['Conversations', '[Networking and breaks]'],
]

function Experience() {
  return (
    <section className="experience-section" id="experience">
      <h2 className="section-title gold-text">The experience</h2>
      <div className="experience-grid">
        {experiences.map(([title, description]) => (
          <article className="experience-card" key={title}><strong>{title}</strong><span>{description}</span></article>
        ))}
      </div>
    </section>
  )
}

export default Experience
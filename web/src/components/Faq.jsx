import { faqItems } from '../data/content.js'

function Faq() {
  return (
    <section className="faq-section" id="faq">
      <h2 className="section-title">FAQ</h2>
      {faqItems.map((item) => (
        <details className="faq-item" key={item.question}>
          <summary>{item.question}</summary>
          <p className="faq-answer">{item.answer}</p>
        </details>
      ))}
    </section>
  )
}

export default Faq
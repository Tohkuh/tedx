import { contact } from '../data/content.js'

function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-details">
        <h2 className="section-title">Contact</h2>
        <span>{contact.email} · {contact.phone} · {contact.socialLinks}</span>
      </div>
      <div className="license-copy">This independent TEDx event is operated under license from TED.</div>
    </section>
  )
}

export default Contact
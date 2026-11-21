import { useState } from 'react'

const links = [
  ['About', '#about'], ['Theme', '#theme'], ['Speakers', '#speakers'],
  ['Experience', '#experience'], ['Sponsors', '#sponsors'], ['Tickets', '#tickets'],
  ['FAQ', '#faq'], ['Contact', '#contact'],
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={closeMenu}>
        <span className="brand-mark">TEDx</span> University of Bamenda
      </a>
      <button aria-controls="primary-navigation" aria-expanded={menuOpen} className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} type="button">
        {menuOpen ? 'Close' : 'Menu'}
      </button>
      <nav aria-label="Main navigation" className={`site-nav${menuOpen ? ' is-open' : ''}`} id="primary-navigation">
        {links.map(([label, href]) => <a href={href} key={href} onClick={closeMenu}>{label}</a>)}
      </nav>
      <a className="btn btn-primary" href="#tickets" onClick={closeMenu}>Get tickets</a>
    </header>
  )
}

export default Navbar
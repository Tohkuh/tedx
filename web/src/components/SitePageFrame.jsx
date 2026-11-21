import { Link } from 'react-router-dom'

function SitePageFrame({ children }) {
  return (
    <main className="page-shell public-page">
      <header className="site-header page-header">
        <Link className="brand" to="/">
          <span className="brand-mark">TEDx</span> University of Bamenda
        </Link>
        <Link className="btn btn-primary" to="/">Back to event</Link>
      </header>
      {children}
      <footer className="public-page-footer">
        <Link to="/">TEDxUniversity of Bamenda</Link>
        <Link to="/sponsors">Sponsors</Link>
        <Link to="/referrals">Referrals</Link>
      </footer>
    </main>
  )
}

export default SitePageFrame
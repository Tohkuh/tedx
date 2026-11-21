import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import Experience from './components/Experience.jsx'
import Faq from './components/Faq.jsx'
import Hero from './components/Hero.jsx'
import Navbar from './components/Navbar.jsx'
import SponsorsPartners from './components/SponsorsPartners.jsx'
import Speakers from './components/Speakers.jsx'
import Theme from './components/Theme.jsx'
import Tickets from './components/Tickets.jsx'
import ToghuBand from './components/ToghuBand.jsx'
import { Navigate, Route, Routes } from 'react-router-dom'
import SponsorsPage from './components/SponsorsPage.jsx'
import ReferralsPage from './components/ReferralsPage.jsx'
import AdminPage from './components/AdminPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={(
        <main className="page-shell w-full">
          <Navbar />
          <ToghuBand />
          <Hero />
          <ToghuBand />
          <About />
          <Theme />
          <Speakers />
          <Experience />
          <ToghuBand variant="blue" />
          <SponsorsPartners />
          <ToghuBand />
          <Tickets />
          <ToghuBand variant="braid" />
          <Faq />
          <Contact />
          <ToghuBand />
        </main>
      )} />
      <Route path="/sponsors" element={<SponsorsPage />} />
      <Route path="/referrals" element={<ReferralsPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

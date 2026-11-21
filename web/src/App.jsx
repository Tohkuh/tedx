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

function App() {
  return (
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
  )
}

export default App

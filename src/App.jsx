import Navbar from './components/Navbar'
import Cursor from './components/Cursor'
import Starfield from './components/three/Starfield'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Lab from './components/Lab'
import Achievements from './components/Achievements'
import Journey from './components/Journey'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Cursor />
      <Starfield />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 2 }}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Lab />
        <Achievements />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

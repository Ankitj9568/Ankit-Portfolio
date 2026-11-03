import Navbar from './components/Navbar'
import Cursor from './components/Cursor'
import BootSequence from './components/Boot'
import SolarStory from './story/SolarStory'
import CinematicDeck from './components/CinematicDeck'

export default function App() {
  return (
    <div className="app-root">
      <Cursor />
      <BootSequence />
      <SolarStory />
      <Navbar />
      <CinematicDeck />
    </div>
  )
}

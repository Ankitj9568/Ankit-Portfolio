import { profile } from '../data'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          Designed & built with <span className="heart">♥</span> by {profile.name} · React + Three.js
        </p>
        <p className="mono">© {new Date().getFullYear()} — exploring the web, one pixel at a time.</p>
      </div>
    </footer>
  )
}

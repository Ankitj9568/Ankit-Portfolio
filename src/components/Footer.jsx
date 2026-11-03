import { profile } from '../data'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-row">
        <p className="footer-left">© {new Date().getFullYear()} {profile.name}</p>
        <p className="footer-right">
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={`mailto:${profile.email}`}>Email</a>
        </p>
      </div>
    </footer>
  )
}

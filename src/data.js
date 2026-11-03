/**
 * ──────────────────────────────────────────────────────────────
 *  EDIT THIS FILE to update all personal content of the site.
 *  (content sourced from CV_Ankit_Guidewire.docx / CV_Ankit_GreyB.docx)
 * ──────────────────────────────────────────────────────────────
 */

export const profile = {
  name: 'Ankit Kumar Jha',
  shortName: 'Ankit',
  initials: 'AKJ',
  email: 'tmsl.it27.ankit@gmail.com',
  phone: '+91 9330447207',
  github: 'https://github.com/Ankitj9568',
  linkedin: 'https://www.linkedin.com/in/ankit-kumar-jha-140b32287/',
  avatar: 'https://avatars.githubusercontent.com/u/146641998?v=4',
  roles: ['Full-Stack Developer', 'Database & Systems Nerd', 'Hackathon Finalist — Top 15', 'Creative Coder'],
  tagline:
    'Database-backed applications, relational schema design and deployed platforms — with a growing love for interactive 3D on the web.',
  location: 'Kolkata, India',
  headline: 'B.Tech IT (2027) · Techno Main Salt Lake, Kolkata',
}

export const about = {
  heading: 'Turning schemas, workflows and ideas into living products',
  paragraphs: [
    `I'm Ankit Kumar Jha — final-year B.Tech Information Technology student at Techno Main Salt Lake, Kolkata (CGPA 7.57). I built my foundation on DBMS, SQL, OOP and computer networks, then took itstraight into deployed, database-backed platforms.`,
    `In 2026 I was a national Top 15 finalist at the IIT Madras × FedEx SMART Center hackathon, designing the workflow engine behind Sentinel — a FedEx debt-recovery allocation platform — and a finalist out of 7,000+ teams at India Innovates 2026, hosted at Bharat Mandapam. I ship real products with Express.js, PostgreSQL and Supabase, and I'm now exploring interactive 3D for the web with Three.js and React Three Fiber (this very site).`,
  ],
  stats: [
    { value: 'Top 15', label: 'FedEx × IIT Madras' },
    { value: '7K+', label: 'Teams Outdone' },
    { value: '7.57', label: 'CGPA (till Sem 6)' },
    { value: '13+', label: 'Public Repos' },
  ],
  education: 'B.Tech IT · Techno Main Salt Lake, Kolkata (2023–2027)',
}

export const achievements = [
  {
    icon: '🥇',
    title: 'Hackathon Finalist — Top 15',
    org: 'IIT Madras × FedEx SMART Center',
    period: 'Feb 2026',
    text: 'Selected among the Top 15 teams nationally for the Sentinel platform — competing against teams from premier engineering institutions across India.',
    accent: '#22d3ee',
    link: 'https://sentinal-weld.vercel.app/login',
  },
  {
    icon: '🏆',
    title: 'Finalist — India Innovates 2026',
    org: 'Ministry Level · Delhi Municipal Corporation',
    period: '2026',
    text: 'Qualified for the finals out of 7,000+ teams across India. The national finale was hosted at Bharat Mandapam, New Delhi.',
    accent: '#facc15',
    link: null,
  },
]

export const skillGroups = [
  {
    icon: '⌨',
    title: 'Programming & Query',
    skills: ['SQL', 'Java (Core)', 'JavaScript', 'HTML5', 'CSS3'],
  },
  {
    icon: '⛁',
    title: 'Databases',
    skills: ['MySQL', 'PostgreSQL', 'Supabase', 'Prisma ORM', 'DBMS', 'Schema Design'],
  },
  {
    icon: '⚙',
    title: 'Backend & Concepts',
    skills: ['Node.js', 'Express.js', 'REST APIs', 'Google OAuth', 'RBAC', 'OOP', 'Computer Networks', 'DSA'],
  },
  {
    icon: '◐',
    title: 'Tools & Exploring',
    skills: ['Git & GitHub', 'Vercel', 'Wireframing', 'React', 'React Three Fiber', 'Three.js'],
  },
]

export const marqueeTech = [
  'SQL', 'PostgreSQL', 'Supabase', 'Prisma', 'Node.js', 'Express.js',
  'Java', 'MySQL', 'DBMS', 'OOP', 'DSA', 'Git', 'Vercel', 'Three.js',
]

export const projects = [
  {
    name: 'RoomSync',
    tagline: 'Household Expense & Collaboration Platform',
    award: null,
    description:
      'A web platform for managing household groups, tasks, expenses, rent dues and settlements — with Express.js + Prisma on Supabase-hosted PostgreSQL, Google OAuth authentication and role-based household workflows.',
    tech: ['Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Supabase', 'Google OAuth'],
    live: 'https://room-synk.vercel.app/',
    repo: 'https://github.com/Ankitj9568/RoomSync',
    accent: '#22d3ee',
  },
  {
    name: 'Sentinel',
    tagline: 'DCA Governance & Recovery Orchestration',
    award: 'IIT Madras × FedEx Finalist (Top 15)',
    description:
      'A FedEx debt-recovery allocation platform prototype: case ingestion, priority allocation, escalation handling and audit logging workflows. I designed the database schema, entity relationships, data-flow diagrams, RBAC documentation and Admin/Vendor/DCA dashboard wireframes.',
    tech: ['SQL', 'DBMS', 'RBAC', 'Workflow Design', 'Dashboards', 'SDLC'],
    live: 'https://sentinal-weld.vercel.app/login',
    repo: 'https://github.com/Ankitj9568/sentinal-FedEx',
    accent: '#a855f7',
  },
  {
    name: 'AI Disaster Predictor',
    tagline: 'AI-powered risk forecasting',
    award: null,
    description:
      'A web system that predicts potential disaster scenarios with AI — surfacing clear, actionable risk insights through an accessible interface.',
    tech: ['JavaScript', 'HTML/CSS', 'AI/ML'],
    live: 'https://sentinelai-livid.vercel.app',
    repo: 'https://github.com/Ankitj9568/AI-based-Disaster-Predictor-system',
    accent: '#34d399',
  },
  {
    name: 'GreenChain',
    tagline: 'Sustainability platform',
    award: null,
    description:
      'An evolving sustainability-focused platform exploring transparent, accountable systems built with modern TypeScript tooling.',
    tech: ['TypeScript', 'Web'],
    live: null,
    repo: 'https://github.com/Ankitj9568/Greenchain',
    accent: '#facc15',
  },
]

export const miniProjects = [
  { name: 'ZERODHA-CLONE', repo: 'https://github.com/Ankitj9568/ZERODHA-CLONE' },
  { name: 'Simon Says Game', repo: 'https://github.com/Ankitj9568/Simon-Says-Game' },
  { name: 'Spotify Home Clone', repo: 'https://github.com/Ankitj9568/Spotify-Home-clone-HTML-CSS' },
  { name: 'Virtual Shootout Toggle', repo: 'https://github.com/Ankitj9568/Virtual-Shootout-Toggle-bar' },
  { name: 'Basic CRUD ToDo', repo: 'https://github.com/Ankitj9568/Basic-ToDo-Html-CSS-JS' },
]

export const journey = [
  {
    period: '2023',
    title: 'Started B.Tech IT at TMSL, Kolkata',
    text: 'Began Information Technology at Techno Main Salt Lake and stumbled into web development — pushed my first repository to GitHub in October 2023.',
  },
  {
    period: '2024',
    title: 'Fundamentals & first builds',
    text: 'Learned layout systems, JavaScript logic and application structure through builds: Zerodha & Spotify clones, a Simon Says game and interactive UI experiments.',
  },
  {
    period: '2025',
    title: 'Sentinel — the FedEx platform',
    text: 'Designed the workflow engine and database schema of a debt-recovery allocation platform: case ingestion, priority allocation, escalation handling, audit logging, RBAC and role dashboards for Admin / Vendor / DCA.',
  },
  {
    period: '2026',
    title: 'National hackathon year',
    text: 'Made the Top 15 nationally at IIT Madras × FedEx SMART Center with Sentinel, qualified out of 7,000+ teams to the India Innovates 2026 finale at Bharat Mandapam — and shipped RoomSync to production.',
  },
  {
    period: '2027',
    title: 'Graduating & going interactive',
    text: 'Final year at TMSL — exploring Three.js and WebGL to make the web feel less like documents and more like experiences. Open to internships and collaborations.',
  },
]

// Inline SVG icons (no icon library, nothing loaded from other sites).
const P = {
  today: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5l3 2'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
  chart: ['M5 20V10', 'M10 20V4', 'M15 20v-7', 'M20 20V8'],
  book: ['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z', 'M4 19V5', 'M8 7h7'],
  chat: ['M4 5h16v11H9l-5 4z', 'M8 9h8', 'M8 12h5'],
  gear: ['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M5 5l2 2', 'M17 17l2 2', 'M19 5l-2 2', 'M7 17l-2 2'],
  plus: ['M12 5v14', 'M5 12h14'],
  check: ['M5 12l5 5 9-10'],
  x: ['M6 6l12 12', 'M18 6L6 18'],
  left: ['M15 5l-7 7 7 7'],
  right: ['M9 5l7 7-7 7'],
  heart: ['M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z'],
  speaker: ['M4 9h4l5-4v14l-5-4H4z', 'M16 9a4 4 0 0 1 0 6', 'M18.5 6.5a7.5 7.5 0 0 1 0 11'],
  stop: ['M7 7h10v10H7z'],
  steth: ['M6 3v6a4 4 0 0 0 8 0V3', 'M10 13v3a4 4 0 0 0 8 0v-2', 'M18 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4z'],
  flower: ['M12 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z', 'M16 12a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z', 'M12 16a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z', 'M8 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z', 'M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z'],
  star: ['M12 3l2.6 5.6 6 .7-4.5 4.1 1.3 6L12 16.4 6.6 19.4l1.3-6L3.4 9.3l6-.7z'],
  moon: ['M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z'],
  drop: ['M12 3c3.5 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.5 6-11z'],
  sparkle: ['M12 3v5', 'M12 16v5', 'M3 12h5', 'M16 12h5', 'M7 7l2 2', 'M15 15l2 2', 'M17 7l-2 2', 'M9 15l-2 2'],
  lock: ['M6 11h12v9H6z', 'M8 11V8a4 4 0 0 1 8 0v3'],
  download: ['M12 4v11', 'M7 10l5 5 5-5', 'M5 20h14'],
  upload: ['M12 20V9', 'M7 14l5-5 5 5', 'M5 4h14'],
  trash: ['M5 7h14', 'M10 7V4h4v3', 'M7 7l1 13h8l1-13'],
  bell: ['M6 16V11a6 6 0 0 1 12 0v5l2 2H4z', 'M10 20a2 2 0 0 0 4 0'],
  baby: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z', 'M9 11h.01', 'M15 11h.01', 'M10 15c1 1 3 1 4 0', 'M12 4c0 2 1 3 2 3'],
  bulb: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-4 10.5c1 1 1.5 2 1.5 3.5h5c0-1.5.5-2.5 1.5-3.5A6 6 0 0 0 12 3z'],
  leaf: ['M5 19c0-8 6-14 15-14 0 9-6 15-14 15', 'M5 19l7-7'],
  heat: ['M8 20c-2-3 2-5 0-8s2-5 0-8', 'M13 20c-2-3 2-5 0-8s2-5 0-8', 'M18 20c-2-3 2-5 0-8s2-5 0-8'],
  bath: ['M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z', 'M6 12V6a2 2 0 0 1 4 0'],
  massage: ['M12 4a8 8 0 1 0 0 16', 'M12 8a4 4 0 1 0 0 8', 'M16 4l3 3-3 3'],
  rest: ['M3 18h18', 'M4 18v-6h16v6', 'M6 12V9h5v3'],
  drinkcup: ['M5 9h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z', 'M17 11h1a2 2 0 0 1 0 4h-1', 'M9 3c-1 2 1 2 0 4', 'M13 3c-1 2 1 2 0 4'],
  pill: ['M8 16l8-8a3.5 3.5 0 0 0-5-5l-8 8a3.5 3.5 0 0 0 5 5z', 'M7 7l5 5'],
  move: ['M13 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z', 'M9 21l2-6 3 3v3', 'M7 12l3-3h4l3 3', 'M11 15l1-6'],
  sleep: ['M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z', 'M15 4h4l-4 4h4'],
  eat: ['M4 12a8 8 0 0 0 16 0z', 'M8 8c0-2 2-2 2-4', 'M13 8c0-2 2-2 2-4'],
  water: ['M7 3h10l-1 18H8z', 'M7.5 9h9'],
  talk: ['M4 5h12v8H8l-4 3z', 'M18 9h2v8l-3-2h-6v-2'],
  phone: ['M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 11v6', 'M12 7.5h.01'],
  print: ['M7 8V3h10v5', 'M5 8h14v8h-2', 'M7 16H5', 'M7 13h10v8H7z'],
  send: ['M4 12l16-8-6 16-3-7z', 'M11 13l9-9'],
  shield: ['M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M9 12l2 2 4-4'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v5h4'],
  play: ['M8 5l11 7-11 7z'],
  pause: ['M8 5v14', 'M16 5v14'],
  skip: ['M6 5l9 7-9 7z', 'M18 5v14'],
  globe: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M3 12h18', 'M12 3c3 3 3 15 0 18', 'M12 3c-3 3-3 15 0 18'],
  eye: ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  diary: ['M6 3h11a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2V4', 'M9 7h6', 'M9 11h6'],
}

export default function Icon({ name, paths, size = 24, className = '', fill = false, label, strokeWidth = 1.8 }) {
  const ds = paths || P[name] || P.info
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" className={className}
      fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false"
    >
      {ds.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

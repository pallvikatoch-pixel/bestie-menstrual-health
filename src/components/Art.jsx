// Small inline-SVG illustrations. Decorative: the lesson text carries the meaning.
const C = { a: 'rgb(var(--accent))', b: 'rgb(var(--blush))', l: 'rgb(var(--lav))', p: 'rgb(var(--peach))', m: 'rgb(var(--mint))', k: 'rgb(var(--plum))', w: 'rgb(var(--card))', c: 'rgb(var(--calm))' }

export function LessonArt({ id, className = '' }) {
  const common = { viewBox: '0 0 160 110', className, 'aria-hidden': true, width: '100%', height: '100%' }
  switch (id) {
    case 'cycle':
      return (
        <svg {...common}>
          <circle cx="80" cy="55" r="40" fill="none" stroke={C.b} strokeWidth="14" />
          <path d="M80 15a40 40 0 0 1 34 19" fill="none" stroke={C.a} strokeWidth="14" strokeLinecap="round" />
          <path d="M120 55a40 40 0 0 1-20 34" fill="none" stroke={C.l} strokeWidth="14" strokeLinecap="round" />
          <circle cx="118" cy="44" r="7" fill={C.p} stroke={C.k} strokeWidth="2" />
          <path d="M80 44c5 6 7 9 7 12a7 7 0 0 1-14 0c0-3 2-6 7-12z" fill={C.a} />
        </svg>
      )
    case 'pcos':
      return (
        <svg {...common}>
          <path d="M60 55c0-20 40-20 40 0" fill="none" stroke={C.a} strokeWidth="5" strokeLinecap="round" />
          <path d="M80 40v-14" stroke={C.a} strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="42" cy="62" rx="22" ry="16" fill={C.b} />
          <ellipse cx="118" cy="62" rx="22" ry="16" fill={C.b} />
          {[[34, 58], [44, 68], [50, 56], [110, 58], [122, 68], [128, 56]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.5" fill={C.w} stroke={C.a} strokeWidth="1.5" />)}
        </svg>
      )
    case 'late':
      return (
        <svg {...common}>
          <rect x="30" y="22" width="72" height="66" rx="10" fill={C.w} stroke={C.k} strokeWidth="3" />
          <path d="M30 40h72" stroke={C.k} strokeWidth="3" />
          {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={38 + c * 15} y={47 + r * 10} width="9" height="6" rx="2" fill={r === 2 && c === 1 ? C.a : C.b} />))}
          <circle cx="118" cy="68" r="22" fill={C.l} stroke={C.k} strokeWidth="3" />
          <path d="M118 56v12l8 5" stroke={C.k} strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      )
    case 'cramps':
      return (
        <svg {...common}>
          <rect x="48" y="30" width="64" height="60" rx="22" fill={C.p} stroke={C.a} strokeWidth="3" />
          <rect x="70" y="18" width="20" height="16" rx="5" fill={C.a} />
          {[60, 72, 84].map((y) => <path key={y} d={`M60 ${y}q10-6 20 0t20 0`} fill="none" stroke={C.a} strokeWidth="2.5" strokeLinecap="round" />)}
          <path d="M28 40c-6 6 6 10 0 16" stroke={C.c} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M132 40c-6 6 6 10 0 16" stroke={C.c} strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'products':
      return (
        <svg {...common}>
          <rect x="18" y="38" width="56" height="30" rx="15" fill={C.w} stroke={C.k} strokeWidth="3" />
          <rect x="30" y="46" width="32" height="14" rx="7" fill={C.b} />
          <path d="M96 30h36l-6 34a12 12 0 0 1-24 0z" fill={C.l} stroke={C.k} strokeWidth="3" />
          <path d="M114 76v14" stroke={C.k} strokeWidth="3" strokeLinecap="round" />
          <rect x="40" y="78" width="40" height="18" rx="4" fill={C.p} />
          <path d="M44 84h32M44 90h24" stroke={C.a} strokeWidth="2" />
        </svg>
      )
    case 'first':
      return (
        <svg {...common}>
          <path d="M80 100V58" stroke={C.c} strokeWidth="4" strokeLinecap="round" />
          <path d="M80 78c-14 0-22-8-24-18 12 0 22 6 24 18zM80 70c14 0 22-8 24-18-12 0-22 6-24 18z" fill={C.m} />
          {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="80" cy="28" rx="9" ry="13" fill={C.b} transform={`rotate(${r} 80 40)`} />)}
          <circle cx="80" cy="40" r="7" fill={C.p} />
        </svg>
      )
    case 'myths':
      return (
        <svg {...common}>
          <path d="M18 22h62v38H44l-14 12V60H18z" fill={C.l} />
          <text x="49" y="50" textAnchor="middle" fontSize="26" fontWeight="800" fill={C.k}>?</text>
          <path d="M80 44h62v38h-12v12l-14-12H80z" fill={C.b} />
          <text x="111" y="72" textAnchor="middle" fontSize="26" fontWeight="800" fill={C.a}>!</text>
        </svg>
      )
    default:
      return null
  }
}

// Cute chibi anime-girl figure in each stretch. Skin stays a fixed warm tone (a face
// shouldn't invert in dark mode); hair and outfit use theme colours so they stay on-brand.
// The pose geometry below is the original stick-figure tracing (it already reads correctly
// at thumbnail size); only the stroke styling and the head changed.
const SKIN = '#F6C9A3'
const HAIR = C.k
const OUTFIT = C.a

function ChibiHead({ cx, cy, rot = 0 }) {
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <circle cx={cx - 9} cy={cy - 5} r="4.5" fill={HAIR} />
      <circle cx={cx + 9} cy={cy - 5} r="4.5" fill={HAIR} />
      <circle cx={cx} cy={cy} r="11.5" fill={HAIR} />
      <circle cx={cx} cy={cy + 1.8} r="9.3" fill={SKIN} />
      <path d={`M${cx - 9.7} ${cy - 1} Q${cx} ${cy - 11.5} ${cx + 9.7} ${cy - 1} Q${cx} ${cy - 4.5} ${cx - 9.7} ${cy - 1}`} fill={HAIR} />
      <circle cx={cx - 3.1} cy={cy + 1.8} r="1.25" fill={C.k} />
      <circle cx={cx + 3.1} cy={cy + 1.8} r="1.25" fill={C.k} />
      <circle cx={cx - 6.2} cy={cy + 5.3} r="1.8" fill={C.b} />
      <circle cx={cx + 6.2} cy={cy + 5.3} r="1.8" fill={C.b} />
      <path d={`M${cx - 2.2} ${cy + 5.8} Q${cx} ${cy + 7.8} ${cx + 2.2} ${cy + 5.8}`} stroke={C.k} strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </g>
  )
}

export function StretchArt({ id, className = '' }) {
  const limb = { stroke: SKIN, strokeWidth: 10, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }
  const torso = { stroke: OUTFIT, strokeWidth: 13, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }
  const mat = <rect x="10" y="92" width="140" height="8" rx="4" fill={C.l} />
  const body = {
    child: <><path d="M110 88l-22-2-14-16" {...torso} /><path d="M74 70l-34 14" {...limb} /><ChibiHead cx={32} cy={86} rot={-6} /></>,
    catcow: <><path d="M44 88V64M106 88V64" {...limb} /><path d="M44 64q31-20 62 0" {...torso} /><ChibiHead cx={118} cy={58} rot={8} /></>,
    knees: <><path d="M30 88h46" {...torso} /><path d="M76 88l14-24 16 9" {...limb} /><path d="M68 86l16-13" {...limb} /><ChibiHead cx={20} cy={86} rot={-4} /></>,
    twist: <><path d="M30 88h52" {...torso} /><path d="M82 88l24-5 9 9" {...limb} /><path d="M48 86l-11-22M57 86l11-22" {...limb} /><ChibiHead cx={20} cy={86} rot={-4} /></>,
    butterfly: <><path d="M26 88h52" {...torso} /><path d="M78 88l18-20 17 20M78 88l18 2" {...limb} /><ChibiHead cx={16} cy={86} rot={-4} /></>,
    breath: <><path d="M30 88h76" {...torso} /><path d="M58 80q9-11 18 0" {...limb} /><ChibiHead cx={20} cy={86} rot={-4} /><circle cx="68" cy="72" r="15" fill="none" stroke={C.c} strokeWidth="3" strokeDasharray="4 5" /></>,
  }[id]
  return <svg viewBox="0 0 160 110" className={className} aria-hidden="true" width="100%" height="100%">{mat}{body}</svg>
}

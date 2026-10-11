import type { ReactNode } from 'react'
import type { ArchetypeIconName } from '../gamedata/types'

const PATHS: Record<ArchetypeIconName, readonly string[]> = {
  gun: ['M3 7h17v4h-8.5l-1.6 7H5.6l1.6-7H3z', 'M11.5 11c.3 1.6 1.3 2.3 2.8 2.3V11', 'M20 9h1.5'],
  sword: ['M20.5 3.5 20 7.5 10.5 17 7 13.5 16.5 4z', 'M5 12l7 7', 'M8.5 15.5 3.5 20.5'],
  crossedBlades: [
    'M20 4l-1 3.4-8.6 8.6-2.4-2.4L16.6 5z',
    'M4 4l3.4 1 8.6 8.6-2.4 2.4L5 7.4z',
    'M6.5 12.5l5 5',
    'M8.8 15.2 4.5 19.5',
    'M17.5 12.5l-5 5',
    'M15.2 15.2l4.3 4.3',
  ],
  axe: [
    'M9.5 21V3',
    'M9.5 5.5c3 0 5.2-1.2 6.8-2.6 2.6 3.6 2.6 10.6 0 14.2-1.6-1.4-3.8-2.6-6.8-2.6z',
    'M9.5 8H7v3.5h2.5',
  ],
  crown: ['M4 17.5 3 7.5l5 4.5 4-6.5 4 6.5 5-4.5-1 10z', 'M4.5 20.5h15'],
  star: ['M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'],
  rook: [
    'M5.5 20.5h13',
    'M7 20.5l1-3h8l1 3',
    'M8.8 17.5l.9-7.5h4.6l.9 7.5',
    'M7 10h10',
    'M7 10V4.5h2.2v2h1.7v-2h2.2v2h1.7v-2H17V10',
  ],
  sniperRifle: [
    'M2.5 12.2 6 11.2h7.5v3H8l-.9 3.6H5.3l.7-3.6H2.5z',
    'M13.5 12.2h8.5v1.4h-8.5',
    'M7 7.6h6.5v2H7z',
    'M8.5 9.6v1.6M12 9.6v1.6',
  ],
  shield: ['M12 3l7.5 3v5.5c0 4.6-3 7.9-7.5 9.5-4.5-1.6-7.5-4.9-7.5-9.5V6z', 'M12 3v18'],
  dagger: ['M12 2.5l2 4V14h-4V6.5z', 'M12 6.5V14', 'M8 14h8', 'M12 14v5', 'M12 21.5a1.2 1.2 0 1 0 0-.1'],
  // A slim sword from the bottom left, crossed by a rifle along the other diagonal.
  swordAndGun: [
    'M20 4l-1 3.4-8.6 8.6-2.4-2.4L16.6 5z',
    'M6.5 12.5l5 5',
    'M8.8 15.2 4.5 19.5',
    'M2.6 2.6L11.44 11.44',
    'M10.52 12.36L14.41 16.25L16.25 14.41L12.36 10.52z',
    'M13.7 11.86L14.97 13.14L16.81 10.02L15.54 8.75z',
    'M14.69 15.96L17.17 19.43L19.92 16.67L16.25 14.41z',
  ],
  crosshair: [
    'M12 4.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15z',
    'M12 2v5M12 17v5M2 12h5M17 12h5',
    'M12 11.2a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6z',
  ],
  sparkle: ['M12 3v5M12 16v5M3 12h5M16 12h5', 'M5.6 5.6l3 3M15.4 15.4l3 3M18.4 5.6l-3 3M8.6 15.4l-3 3'],
}

/** An archetype's line icon (UI Design: Archetype rows). It takes the text colour. */
export function ArchetypeIcon({ name, className }: { readonly name: ArchetypeIconName; readonly className?: string }) {
  const paths: ReactNode = PATHS[name].map((d) => <path key={d} d={d} />)
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  )
}

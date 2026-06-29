// Lawen ("medicine/remedy" in Mapuche) — Koonek's AI copilot character.
// Same Patagonian-feather silhouette as Kaiken's Yatel (circle + three
// brand-accent feathers, cheek markings, diamond collar), with a
// stethoscope worn around the neck to mark it as Koonek's clinical copilot.

interface LawenAvatarProps {
  size?: number;
  className?: string;
}

export default function LawenAvatar({ size = 40, className }: LawenAvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="56" stroke="#D0D8E4" strokeWidth="1.4" />

      {/* Patagonian feathers fanning above the face, in the three brand accents */}
      <polygon points="60,8 68,34 52,34" fill="#3D6B4F" opacity=".9" />
      <polygon points="38,16 50,38 32,30" fill="#7BAFC4" opacity=".85" />
      <polygon points="82,16 88,30 70,38" fill="#C0623A" opacity=".85" />

      {/* head */}
      <circle cx="60" cy="68" r="28" fill="#FFFFFF" stroke="#0D0F12" strokeWidth="2.2" />

      {/* face paint */}
      <line x1="42" y1="75" x2="50" y2="70" stroke="#C0623A" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="70" y1="70" x2="78" y2="75" stroke="#C0623A" strokeWidth="2.2" strokeLinecap="round" />

      {/* eyes */}
      <circle cx="50" cy="64" r="2.6" fill="#0D0F12" />
      <circle cx="70" cy="64" r="2.6" fill="#0D0F12" />

      {/* mouth */}
      <path d="M50,80 Q60,86 70,80" stroke="#0D0F12" strokeWidth="2.2" fill="none" strokeLinecap="round" />

       {/* necklace pendant */}
      {/* <polygon points="60,98 64,104 60,110 56,104" fill="#7BAFC4" /> */}
      {/* <polygon points="60,104 67,111 60,118 53,111" fill="#7BAFC4" /> */}

      {/* Face */}
      {/* <circle cx="60" cy="68" r="28" fill="#FFFFFF" stroke="#0D0F12" strokeWidth="1.6" />
      <circle cx="50" cy="64" r="3.2" fill="#0D0F12" />
      <circle cx="70" cy="64" r="3.2" fill="#0D0F12" />
      <path d="M48,76 C52,82 68,82 72,76" stroke="#0D0F12" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="44" y1="68" x2="50" y2="72" stroke="#C0623A" strokeWidth="2" strokeLinecap="round" />
      <line x1="76" y1="68" x2="70" y2="72" stroke="#C0623A" strokeWidth="2" strokeLinecap="round" /> */}

      {/* Stethoscope draped around the neck — tubing + earpieces + diamond collar */}
      <path d="M40,96 C40,106 80,106 80,96" stroke="#7BAFC4" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M40,96 L36,80" stroke="#7BAFC4" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M80,96 L84,80" stroke="#7BAFC4" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="110" r="4.0" fill="none" stroke="#7BAFC4" stroke-width="2"></circle>
      <circle cx="60" cy="110" r="1.5" fill="#7BAFC4"></circle>
    </svg>
  );
}

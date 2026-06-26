// Koonek HOP isotipo — stethoscope arch + Patagonian peak + medical cross,
// framed by the aonikenk.dev corner brackets. Source: koonek-brand.html
// (aonikenk.dev Brand Manual v2.0, "Principal Claro" variant).

export type LogoVariant = 'light' | 'dark';

interface IsotipoProps {
  size?: number;
  variant?: LogoVariant;
}

export function KoonekIsotipo({ size = 32, variant = 'light' }: IsotipoProps) {
  const outerRing = variant === 'dark' ? '#2A3140' : '#D0D8E4';
  const bracketColor = '#7BAFC4';
  const archColor = '#3D6B4F';
  const crossColor = '#C0623A';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" stroke={outerRing} strokeWidth="1.2" />
      <path
        d="M22,65 C22,35 78,35 78,65"
        fill="none"
        stroke={archColor}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <polygon
        points="50,30 65,58 35,58"
        fill="none"
        stroke={archColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="50" y1="24" x2="50" y2="36" stroke={crossColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="30" x2="56" y2="30" stroke={crossColor} strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="68" r="4" fill="none" stroke={bracketColor} strokeWidth="1.8" />
      <circle cx="50" cy="68" r="1.5" fill={bracketColor} />
      <path d="M13,26 L13,13 L26,13" stroke={bracketColor} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      <path d="M87,26 L87,13 L74,13" stroke={bracketColor} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      <path d="M13,74 L13,87 L26,87" stroke={bracketColor} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      <path d="M87,74 L87,87 L74,87" stroke={bracketColor} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
    </svg>
  );
}

interface ImagotipoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: LogoVariant;
}

export function KoonekImagotipo({ size = 'md', variant = 'light' }: ImagotipoProps) {
  const isoSize = size === 'lg' ? 64 : size === 'sm' ? 28 : 40;
  const nameSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl';
  const nameColor = variant === 'dark' ? 'text-white' : 'text-text';
  const tagColor = variant === 'dark' ? 'text-white/40' : 'text-muted';

  return (
    <div className="flex items-center gap-4">
      <KoonekIsotipo size={isoSize} variant={variant} />
      <div className={`w-px self-stretch ${variant === 'dark' ? 'bg-white/10' : 'bg-border'}`} />
      <div className="flex flex-col gap-1">
        <span className={`font-display font-bold tracking-tight leading-none ${nameSize} ${nameColor}`}>
          Koonek<span className="ml-1 font-mono font-light text-glacier">HOP</span>
        </span>
        <span className={`font-mono font-light text-2xs tracking-[.18em] uppercase ${tagColor}`}>
          AI-powered Healthcare Operations Platform
        </span>
      </div>
    </div>
  );
}

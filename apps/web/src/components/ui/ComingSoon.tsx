interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="kpi-card flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="font-display font-bold text-lg text-text">{title}</p>
      <p className="text-sm text-muted max-w-sm">
        This screen is part of the Koonek HOP component-kit phase and is not built yet.
      </p>
    </div>
  );
}

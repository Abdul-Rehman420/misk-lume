interface SectionHeaderProps {
  label: string;
  title: string;
}

export default function SectionHeader({ label, title }: SectionHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold">
        {label}
      </span>
      <h2 className="mt-3 font-display text-3xl font-medium text-text-primary">
        {title}
      </h2>
      <div className="mt-4 h-px w-[60px] bg-accent-gold" />
    </div>
  );
}

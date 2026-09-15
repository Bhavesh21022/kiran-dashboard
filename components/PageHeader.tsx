import Link from "next/link";

export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <Link href="/" className="mb-3 inline-block text-xs text-white/40 hover:text-white/70">
        ← Back to Dashboard
      </Link>
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
    </div>
  );
}

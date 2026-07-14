import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  showText?: boolean;
}

export default function Logo({ className = '', imageClassName = 'h-10 md:h-12 w-auto', showText = false }: LogoProps) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-3 shrink-0 border-0 bg-transparent shadow-none outline-none focus:outline-none focus-visible:ring-0 ${className}`}
      aria-label="MECCIO Home"
    >
      <img
        src="/icon.png"
        alt=""
        aria-hidden="true"
        className="h-10 w-10 md:h-11 md:w-11 shrink-0 rounded-full border-0 object-cover shadow-none outline-none"
      />
      <img
        src="/logo.svg"
        alt="MECCIO"
        className={`border-0 object-contain shadow-none outline-none ${imageClassName}`}
      />
      {showText && (
        <span className="font-display text-2xl tracking-[0.15em] text-charcoal hidden sm:inline">
          MECCIO
        </span>
      )}
    </Link>
  );
}

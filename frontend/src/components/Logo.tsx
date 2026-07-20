import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  /** Tailwind size classes for the mark (square seal). */
  imageClassName?: string;
  /** @deprecated Brand mark already includes the name. */
  showText?: boolean;
}

export default function Logo({
  className = '',
  imageClassName = 'h-12 w-12 md:h-14 md:w-14',
}: LogoProps) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center shrink-0 border-0 bg-transparent shadow-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 rounded-full ${className}`}
      aria-label="MECCIO RUGS Home"
    >
      <img
        src="/logo.png"
        alt="MECCIO RUGS"
        width={112}
        height={112}
        decoding="async"
        className={`rounded-full border-0 object-cover shadow-none outline-none ${imageClassName}`}
      />
    </Link>
  );
}

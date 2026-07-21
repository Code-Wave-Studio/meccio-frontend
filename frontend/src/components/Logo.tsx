import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  /** Tailwind size classes for the circular seal (logo.png). */
  imageClassName?: string;
  /** Tailwind size classes for the MECCIO RUGS wordmark SVG. */
  wordmarkClassName?: string;
  /** Hide the wordmark (seal only). */
  sealOnly?: boolean;
  /** @deprecated Brand wordmark is the SVG beside the seal. */
  showText?: boolean;
}

export default function Logo({
  className = '',
  imageClassName = 'h-12 w-12 md:h-14 md:w-14',
  wordmarkClassName = 'h-8 md:h-9 w-auto',
  sealOnly = false,
}: LogoProps) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 md:gap-3 shrink-0 border-0 bg-transparent shadow-none outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 rounded-sm ${className}`}
      aria-label="MECCIO RUGS Home"
    >
      <img
        src="/logo.png"
        alt=""
        width={112}
        height={112}
        decoding="async"
        className={`rounded-full border-0 object-cover shadow-none outline-none shrink-0 ${imageClassName}`}
      />
      {!sealOnly && (
        <img
          src="/meccio-rugs.svg"
          alt="MECCIO RUGS"
          width={420}
          height={72}
          decoding="async"
          className={`border-0 object-contain shadow-none outline-none ${wordmarkClassName}`}
        />
      )}
    </Link>
  );
}

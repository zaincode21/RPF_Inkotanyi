const LOGO_SRC = '/logo-fpr-inkotanyi.png';

/**
 * Official FPR Inkotanyi crest.
 * @param {'sm'|'md'|'lg'|'xl'} size
 * @param {boolean} withWordmark — show "FPR Inkotanyi" text beside crest (optional; logo already includes text)
 */
export function BrandLogo({
  size = 'md',
  className = '',
  showText = false,
  onClick,
  variant = 'full', // 'full' | 'compact'
}) {
  const heights = {
    sm: 36,
    md: 48,
    lg: 72,
    xl: 120,
  };
  const h = heights[size] || heights.md;

  return (
    <div
      className={`brand-logo ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: onClick ? 'pointer' : 'default',
        lineHeight: 0,
      }}
    >
      <img
        src={LOGO_SRC}
        alt="FPR Inkotanyi"
        height={h}
        style={{
          height: h,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
        draggable={false}
      />
      {showText && variant === 'compact' && (
        <span className="brand-logo__text">
          FPR <em>Inkotanyi</em>
        </span>
      )}
    </div>
  );
}

export default BrandLogo;

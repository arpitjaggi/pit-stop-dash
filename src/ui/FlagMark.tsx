/** The chequered-flag mark: the app's one logo, used wherever an icon is needed. */
export function FlagMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Pit Stop">
      <rect width="64" height="64" rx="16" fill="#DC0000" />
      <rect x="15" y="11" width="4" height="44" rx="2" fill="#FFFFFF" />
      <rect x="22.0" y="14.0" width="9.5" height="9.5" fill="#FFFFFF" />
      <rect x="22.0" y="23.5" width="9.5" height="9.5" fill="#17140F" />
      <rect x="22.0" y="33.0" width="9.5" height="9.5" fill="#FFFFFF" />
      <rect x="31.5" y="14.0" width="9.5" height="9.5" fill="#17140F" />
      <rect x="31.5" y="23.5" width="9.5" height="9.5" fill="#FFFFFF" />
      <rect x="31.5" y="33.0" width="9.5" height="9.5" fill="#17140F" />
      <rect x="41.0" y="14.0" width="9.5" height="9.5" fill="#FFFFFF" />
      <rect x="41.0" y="23.5" width="9.5" height="9.5" fill="#17140F" />
      <rect x="41.0" y="33.0" width="9.5" height="9.5" fill="#FFFFFF" />
      <rect x="50.5" y="14.0" width="9.5" height="9.5" fill="#17140F" />
      <rect x="50.5" y="23.5" width="9.5" height="9.5" fill="#FFFFFF" />
      <rect x="50.5" y="33.0" width="9.5" height="9.5" fill="#17140F" />
    </svg>
  );
}

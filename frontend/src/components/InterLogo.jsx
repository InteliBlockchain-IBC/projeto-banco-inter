export default function InterLogo() {
  return (
    <svg viewBox="0 112 531 152" role="img" aria-label="Inter" className="h-8 w-28" xmlns="http://www.w3.org/2000/svg">
      <filter id="inter-logo-transparent-white" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 -1.214 0 1.214" />
      </filter>
      <image href="/logo_inter.png" width="531" height="376" filter="url(#inter-logo-transparent-white)" />
    </svg>
  );
}

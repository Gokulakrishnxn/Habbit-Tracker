/** The Habit Tracker mark (a blob with two eyes and trailing droplets), for generated PNG icons. */
const BLOB =
  "M300 118C378 118 424 178 424 248C424 328 362 388 286 388C258 388 240 376 222 366C202 355 196 338 176 332C158 327 152 310 162 297C172 284 188 282 190 266C192 250 178 240 192 218C208 192 248 118 300 118Z";

export function BlobLogo({ size, scale = 1 }: { size: number; /** <1 shrinks the mark to leave a safe margin (maskable icons) */ scale?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={size} height={size}>
      <defs>
        <linearGradient id="ink" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#3a3a3f" />
          <stop offset="1" stopColor="#121214" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="#ffffff" />
      <g transform={`translate(256 256) scale(${scale}) translate(-256 -256)`}>
        <path d={BLOB} fill="#9ca3af" transform="translate(-9 12)" />
        <path d={BLOB} fill="url(#ink)" />
        <ellipse cx="332" cy="246" rx="13" ry="20" fill="#ffffff" />
        <ellipse cx="382" cy="246" rx="13" ry="20" fill="#ffffff" />
        <circle cx="134" cy="262" r="7" fill="#9ca3af" />
        <circle cx="166" cy="352" r="10" fill="#9ca3af" />
      </g>
    </svg>
  );
}

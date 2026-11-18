import type { IconName } from "@/lib/habits";

const PATHS: Record<IconName, string> = {
  sparkles:
    "M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3zM19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7L19 15z",
  droplet: "M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z",
  dumbbell: "M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11",
  briefcase:
    "M4 8h16a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zM9 8V6a1 1 0 011-1h4a1 1 0 011 1v2M3 13h18",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5",
  heart: "M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z",
  sun: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  moon: "M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z",
  coffee: "M4 9h12v6a4 4 0 01-4 4H8a4 4 0 01-4-4V9zM16 10h2a2 2 0 010 4h-2M7 3v3M11 3v3",
  music: "M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
  pencil: "M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19l-4 1zM14 7l3 3",
  flame: "M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z",
  leaf: "M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8",
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z",
  pill: "M10.5 20.5a4.95 4.95 0 01-7-7l10-10a4.95 4.95 0 017 7l-10 10zM8.5 8.5l7 7",
  check: "M5 12l5 5L20 7",
  book: "M12 6c-1.5-1.2-3.5-2-6-2H3v14h3c2.5 0 4.5.8 6 2 1.5-1.2 3.5-2 6-2h3V4h-3c-2.5 0-4.5.8-6 2zM12 6v14",
};

export default function HabitIcon({ name, className = "size-4" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

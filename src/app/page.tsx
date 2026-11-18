import HabitTracker from "@/components/HabitTracker";

export default function Home() {
  return (
    <main className="flex-1 px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8 md:px-10">
      <HabitTracker />
    </main>
  );
}

import PageShell from "@/components/PageShell";
import SettingsHabits from "@/components/SettingsHabits";

export default function Settings() {
  return (
    <PageShell title="Settings" back={{ href: "/", label: "Back to habits" }}>
      <SettingsHabits />
    </PageShell>
  );
}

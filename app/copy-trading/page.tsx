import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Copy Trading",
  description: "Copy top traders and mirror their strategies in real time.",
};

export default function Page() {
  return <PlaceholderPage title="Copy Trading" description="Follow experienced traders and automatically copy their strategies." />;
}

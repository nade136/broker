import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Options Trading",
  description: "Trade options on major assets with Bridgecore.",
};

export default function Page() {
  return <PlaceholderPage title="Options Trading" description="Trade options with strategic flexibility and defined risk." />;
}

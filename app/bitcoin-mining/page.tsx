import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Bitcoin Mining",
  description: "Bitcoin mining with Bridgecore.",
};

export default function Page() {
  return <PlaceholderPage title="Bitcoin Mining" description="Mine Bitcoin with our secure and efficient infrastructure." />;
}

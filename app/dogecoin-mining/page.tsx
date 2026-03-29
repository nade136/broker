import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Dogecoin Mining",
  description: "Dogecoin mining with Bridgecore.",
};

export default function Page() {
  return <PlaceholderPage title="Dogecoin Mining" description="Mine Dogecoin with our mining solutions." />;
}

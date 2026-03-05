import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "What is Leverage",
  description: "Learn what leverage is and how it works in trading.",
};

export default function Page() {
  return <PlaceholderPage title="What is Leverage" description="Understand leverage and how it can amplify your trading positions." />;
}

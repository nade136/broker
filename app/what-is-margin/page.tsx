import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "What is Margin",
  description: "Learn what margin is in trading.",
};

export default function Page() {
  return <PlaceholderPage title="What is Margin" description="Understand margin and margin trading." />;
}

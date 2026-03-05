import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "What is Spread",
  description: "Learn what spread is in trading.",
};

export default function Page() {
  return <PlaceholderPage title="What is Spread" description="Understand bid-ask spread and how it affects your trades." />;
}

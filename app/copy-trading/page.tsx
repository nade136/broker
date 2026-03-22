import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Auto Trading",
  description: "Automated trading strategies that execute in real time.",
};

export default function Page() {
  return (
    <PlaceholderPage
      title="Auto Trading"
      description="Use automated strategies that follow professional rules and execute trades in real time."
    />
  );
}

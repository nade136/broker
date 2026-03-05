import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Stocks Trading",
  description: "Trade global stocks with Web. Apple, Tesla, NVIDIA and more.",
};

export default function Page() {
  return <PlaceholderPage title="Stocks Trading" description="Trade shares of leading global companies with real-time data and seamless execution." />;
}

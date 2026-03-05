import type { Metadata } from "next";
import PlaceholderPage from "../components/PlaceholderPage";

export const metadata: Metadata = {
  title: "Crypto Mining",
  description: "Crypto mining solutions with Web.",
};

export default function Page() {
  return <PlaceholderPage title="Crypto Mining" description="Earn passive income with efficient and secure mining systems." />;
}

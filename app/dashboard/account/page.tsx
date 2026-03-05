import type { Metadata } from "next";
import AccountInfo from "./AccountInfo";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  return <AccountInfo />;
}

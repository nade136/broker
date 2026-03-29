import type { Metadata } from "next";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Staff sign-in",
  description: "Sign in to the Bridgecore control dashboard.",
  openGraph: {
    title: "Staff sign-in | Bridgecore",
    description: "Sign in to the Bridgecore control dashboard.",
  },
  twitter: {
    title: "Staff sign-in | Bridgecore",
    description: "Sign in to the Bridgecore control dashboard.",
  },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}


import type { Metadata } from "next";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the Bridgecore admin dashboard.",
  openGraph: {
    title: "Admin Login | Bridgecore",
    description: "Sign in to the Bridgecore admin dashboard.",
  },
  twitter: {
    title: "Admin Login | Bridgecore",
    description: "Sign in to the Bridgecore admin dashboard.",
  },
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}


import type { Metadata } from "next";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the Web admin dashboard.",
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}


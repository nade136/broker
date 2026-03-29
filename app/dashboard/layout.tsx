import SmartsuppChat from "../components/SmartsuppChat";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
      <SmartsuppChat />
    </>
  );
}

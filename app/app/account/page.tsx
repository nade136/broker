import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
};

export default function AccountPage() {
  const rows = [
    ["Profile Picture", "–"],
    ["Firstname", "nade"],
    ["Lastname", "like"],
    ["Email", "allenmunadek@gmail.com"],
    ["Password", "••••••••"],
    ["Address", "–"],
    ["Status", "Deleted"],
    ["Mode", "Demo"],
  ];

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">
        My Info
      </h1>
      <div className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between py-3 text-xs"
          >
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-800 dark:text-gray-100">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


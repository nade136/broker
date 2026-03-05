"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AccountInfo() {
  const [profile, setProfile] = useState<{
    firstname: string;
    lastname: string;
    email: string;
    address: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("firstname, lastname, email, address, status").eq("id", user.id).single();
      if (data) {
        setProfile({
          firstname: data.firstname ?? "",
          lastname: data.lastname ?? "",
          email: data.email ?? "",
          address: data.address ?? "–",
          status: data.status ?? "Active",
        });
      }
    };
    load();
  }, []);

  if (!profile) {
    return (
      <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  const rows: [string, string][] = [
    ["Firstname", profile.firstname || "–"],
    ["Lastname", profile.lastname || "–"],
    ["Email", profile.email || "–"],
    ["Address", profile.address || "–"],
    ["Status", profile.status || "–"],
  ];

  return (
    <div className="rounded-2xl bg-white px-5 py-5 shadow-sm dark:bg-slate-900">
      <h1 className="mb-4 text-base font-semibold text-[#141d22] dark:text-gray-100">
        My Info
      </h1>
      <div className="divide-y divide-gray-100 text-xs dark:divide-gray-800">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-3 text-xs">
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="text-gray-800 dark:text-gray-100">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

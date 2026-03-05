"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { createAdminUser } from "../actions";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [addAdminEmail, setAddAdminEmail] = useState("");
  const [addAdminPassword, setAddAdminPassword] = useState("");
  const [addAdminSubmitting, setAddAdminSubmitting] = useState(false);
  const [addAdminError, setAddAdminError] = useState("");

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: e } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .order("created_at", { ascending: false });
    if (e) {
      setError(e.message);
      setProfiles([]);
    } else {
      setProfiles((data ?? []) as Profile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const setRole = async (userId: string, role: "admin" | "user") => {
    const { error: e } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (e) setError(e.message);
    else setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, role } : p)));
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    const { error: e } = await supabase.from("profiles").delete().eq("id", deleteConfirmId);
    if (e) setError(e.message);
    else setProfiles((prev) => prev.filter((p) => p.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError("");
    setAddAdminSubmitting(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setAddAdminError("You must be signed in. Refresh and try again.");
      setAddAdminSubmitting(false);
      return;
    }
    const result = await createAdminUser(addAdminEmail, addAdminPassword, session.access_token);
    setAddAdminSubmitting(false);
    if (result.ok) {
      setAddAdminOpen(false);
      setAddAdminEmail("");
      setAddAdminPassword("");
      fetchProfiles();
    } else {
      setAddAdminError(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[#141d22] dark:text-gray-100">
            Users
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Manage user accounts and admins. Make a user admin so they can access the admin dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAddAdminOpen(true)}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600"
          >
            Add admin
          </button>
          <input
            type="search"
            placeholder="Search users..."
            className="w-full max-w-xs rounded-full border border-gray-200 px-4 py-2 text-xs outline-none focus:border-amber-500 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                  Role
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Loading…
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-[#141d22] dark:text-gray-100">
                      <Link
                        href={`/admin/users/${p.id}`}
                        className="text-amber-600 hover:underline dark:text-amber-400"
                      >
                        {p.full_name || "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {p.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          p.role === "admin"
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300"
                        }`}
                      >
                        {p.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${p.id}`}
                          className="inline-block rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                        >
                          Edit
                        </Link>
                        {p.role === "admin" ? (
                          <button
                            type="button"
                            onClick={() => setRole(p.id, "user")}
                            className="rounded-lg border border-amber-200 px-2 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
                          >
                            Remove admin
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRole(p.id, "admin")}
                            className="rounded-lg border border-amber-200 px-2 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
                          >
                            Make admin
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                          title="Delete user"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && profiles.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
            No users yet. Users appear here when they sign up. Add an admin with the button
            above.
          </p>
        )}
      </div>

      {addAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <h3 className="text-base font-semibold text-[#141d22] dark:text-gray-100">
              Add new admin
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Create a new user and give them admin access. They can sign in at /admin/login.
            </p>
            <form onSubmit={handleAddAdmin} className="mt-4 space-y-3">
              {addAdminError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {addAdminError}
                </p>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={addAdminEmail}
                  onChange={(e) => setAddAdminEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={addAdminPassword}
                  onChange={(e) => setAddAdminPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800 dark:text-gray-100"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddAdminOpen(false);
                    setAddAdminError("");
                  }}
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium dark:border-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addAdminSubmitting}
                  className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-70"
                >
                  {addAdminSubmitting ? "Creating…" : "Create admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <h3 className="text-base font-semibold text-[#141d22] dark:text-gray-100">
              Delete this user?
            </h3>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              This removes their profile. To fully remove the account you may also need to delete
              the user in Supabase Authentication.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


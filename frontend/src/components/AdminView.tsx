"use client";

import React, { useState } from "react";
import {
  Settings,
  Users,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Key,
  Cloud,
  Clock,
  Sparkles,
} from "lucide-react";
import { User } from "@/lib/api";

interface AdminViewProps {
  users: User[];
  currentUser: User | null;
  onUpdateRole: (id: number, role: string) => Promise<void>;
  onApproveUser: (id: number) => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  users,
  currentUser,
  onUpdateRole,
  onApproveUser,
}) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const roles = [
    { key: "super_admin", label: "Super Admin" },
    { key: "env_admin", label: "Environment Admin" },
    { key: "developer_tester", label: "Developer / Tester" },
    { key: "finops", label: "FinOps / Cost Viewer" },
    { key: "content_manager", label: "Content Manager" },
    { key: "viewer", label: "Viewer" },
  ];

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      await onUpdateRole(userId, newRole);
    } catch (err: any) {
      alert(`Role update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      await onApproveUser(userId);
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-white">
            Administration & Zoho Identity Governance
          </h1>
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
            RBAC & SSO Policy
          </span>
        </div>
        <p className="text-slate-400 text-xs mt-1">
          Configure employee access levels, approve incoming Zoho SSO accounts, and manage least-privilege cloud roles.
        </p>
      </div>

      {/* Zoho SSO Integration Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Zoho Single Sign-On (OIDC / OAuth 2.0)
              </h3>
              <p className="text-xs text-slate-400">
                Federated Identity Provider for internal employee authentication
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Active & Enforcing
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <div>
            <span className="text-[10px] text-slate-400 block">Auth Scope</span>
            <span className="font-mono text-cyan-300">AaaServer.profile.READ</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">User Provisioning</span>
            <span className="font-semibold text-slate-200">SSO + Admin Approval</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Token Validation</span>
            <span className="font-semibold text-emerald-400">Backend Verified (Every API)</span>
          </div>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">
              Employee Directory & Role-Based Access Control (RBAC)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {users.length} Registered Employees
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Zoho Subject ID</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Assigned Role</th>
                <th className="py-3 px-3">Access Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          u.avatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        }
                        alt={u.name}
                        className="h-7 w-7 rounded-lg object-cover ring-1 ring-white/10"
                      />
                      <div>
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                    {u.zoho_id || "ZOHO-MANUAL"}
                  </td>
                  <td className="py-3 px-3 text-slate-300">{u.department}</td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={updatingId === u.id}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {roles.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        u.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {u.status === "active" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          Pending Approval
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {u.status !== "active" && (
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition cursor-pointer"
                      >
                        Approve Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

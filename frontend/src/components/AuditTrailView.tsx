"use client";

import React, { useState } from "react";
import {
  ScrollText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  X,
} from "lucide-react";
import { AuditEvent, User } from "@/lib/api";

interface AuditTrailViewProps {
  auditEvents: AuditEvent[];
  currentUser: User | null;
  onExportCsv: () => void;
  onRefresh: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditEvents,
  currentUser,
  onExportCsv,
  onRefresh,
}) => {
  const [searchActor, setSearchActor] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [resourceFilter, setResourceFilter] = useState("All");
  const [selectedDetails, setSelectedDetails] = useState<AuditEvent | null>(null);

  const actions = [
    "All",
    "ENV_START",
    "ENV_STOP",
    "AUTH_LOGIN",
    "APP_LAUNCH",
    "CONTENT_UPLOAD",
    "CONTENT_DOWNLOAD",
    "USER_ROLE_CHANGE",
  ];

  const resources = ["All", "environment", "application", "presentation", "video", "user", "costing"];

  const filteredEvents = auditEvents.filter((e) => {
    const matchesActor =
      e.actor_email.toLowerCase().includes(searchActor.toLowerCase()) ||
      (e.resource_id && e.resource_id.toLowerCase().includes(searchActor.toLowerCase()));
    const matchesAction = actionFilter === "All" || e.action === actionFilter;
    const matchesResource = resourceFilter === "All" || e.resource_type === resourceFilter;
    return matchesActor && matchesAction && matchesResource;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes("START")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    if (action.includes("STOP")) return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    if (action.includes("AUTH")) return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
    if (action.includes("UPLOAD")) return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Platform Audit Trail & Compliance Log
            </h1>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Append-Only Tamper Proof
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Immutable log recording authentication, EC2 lifecycle operations, tool launches, and administrative actions with Zoho employee identities.
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Export Audit Trail (CSV)
        </button>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor email or resource ID..."
            value={searchActor}
            onChange={(e) => setSearchActor(e.target.value)}
            className="bg-transparent border-none text-white text-xs w-full focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
            >
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Resource:</span>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none capitalize"
            >
              {resources.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource Type</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : "Just now"}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">
                    {evt.actor_email}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionBadgeColor(
                        evt.action
                      )}`}
                    >
                      {evt.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-400">
                    {evt.resource_type}
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-300 text-[11px]">
                    {evt.resource_id || "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {evt.ip_address}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedDetails(evt)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                      title="Inspect event payload"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  Audit Event #{selectedDetails.id} Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetails(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div>Actor: <strong className="text-white">{selectedDetails.actor_email}</strong></div>
              <div>Action: <strong className="text-cyan-400">{selectedDetails.action}</strong></div>
              <div>Resource: <strong className="text-white">{selectedDetails.resource_type} ({selectedDetails.resource_id})</strong></div>
              <div>Timestamp: <strong className="text-slate-400">{selectedDetails.timestamp}</strong></div>
              <div>Client IP: <strong className="text-slate-400">{selectedDetails.ip_address}</strong></div>

              <div className="pt-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Structured Details Payload:
                </span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  {JSON.stringify(selectedDetails.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

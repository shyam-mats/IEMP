"use client";

import React, { useState } from "react";
import {
  Server,
  Play,
  Square,
  Search,
  Filter,
  Plus,
  Clock,
  Activity,
  History,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Cpu,
  ShieldCheck,
  X,
} from "lucide-react";
import { Environment, User } from "@/lib/api";

interface EnvironmentsViewProps {
  environments: Environment[];
  currentUser: User | null;
  onStart: (id: number) => Promise<void>;
  onStop: (id: number) => Promise<void>;
  onCreate: (data: Partial<Environment>) => Promise<void>;
  onRefresh: () => void;
}

export const EnvironmentsView: React.FC<EnvironmentsViewProps> = ({
  environments,
  currentUser,
  onStart,
  onStop,
  onCreate,
  onRefresh,
}) => {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Stop Confirmation Modal State
  const [stopConfirmEnv, setStopConfirmEnv] = useState<Environment | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Register New Environment Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvEc2Id, setNewEnvEc2Id] = useState("");
  const [newEnvRegion, setNewEnvRegion] = useState("us-east-1");
  const [newEnvType, setNewEnvType] = useState("t3.xlarge");
  const [newEnvTeam, setNewEnvTeam] = useState("Platform QA");
  const [newEnvDesc, setNewEnvDesc] = useState("");
  const [newEnvRate, setNewEnvRate] = useState("0.1664");

  const canRegister = currentUser?.role === "super_admin" || currentUser?.role === "env_admin";

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartClick = async (env: Environment) => {
    setActionLoading(env.id);
    try {
      await onStart(env.id);
    } catch (e: any) {
      alert(`Start failed: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmStop = async () => {
    if (!stopConfirmEnv) return;
    const envId = stopConfirmEnv.id;
    setStopConfirmEnv(null);
    setActionLoading(envId);
    try {
      await onStop(envId);
    } catch (e: any) {
      alert(`Stop failed: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName || !newEnvEc2Id) {
      alert("Please provide an environment name and EC2 instance ID.");
      return;
    }
    if (!newEnvEc2Id.startsWith("i-")) {
      alert("EC2 instance ID must begin with 'i-' (e.g. i-0abcdef1234567890)");
      return;
    }

    try {
      await onCreate({
        name: newEnvName,
        ec2_instance_id: newEnvEc2Id,
        region: newEnvRegion,
        instance_type: newEnvType,
        team: newEnvTeam,
        description: newEnvDesc,
        hourly_rate: parseFloat(newEnvRate) || 0.1664,
        owner_email: currentUser?.email || "admin@company.com",
      });
      setIsCreateModalOpen(false);
      setNewEnvName("");
      setNewEnvEc2Id("");
      setNewEnvDesc("");
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    }
  };

  const filteredEnvs = environments.filter((env) => {
    const matchesSearch =
      env.name.toLowerCase().includes(search.toLowerCase()) ||
      env.ec2_instance_id.toLowerCase().includes(search.toLowerCase()) ||
      env.team.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = regionFilter === "All" || env.region === regionFilter;
    const matchesState = stateFilter === "All" || env.lifecycle_state === stateFilter;
    return matchesSearch && matchesRegion && matchesState;
  });

  const regions = ["All", "us-east-1", "us-east-2", "us-west-2", "eu-west-1", "ap-south-1"];
  const states = ["All", "running", "stopped", "starting", "stopping", "failed"];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Environment Lifecycle Management
            </h1>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              {environments.length} Total Registered
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Control assigned AWS EC2 test instances. Stopping an instance preserves EBS storage and prevents idle infrastructure burn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs transition cursor-pointer"
            title="Refresh status from AWS"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          {canRegister && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Register Environment
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, instance ID (i-0...), or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-white text-xs w-full focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
            >
              {states.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Environments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredEnvs.map((env) => {
          const isRunning = env.lifecycle_state === "running";
          const isStopped = env.lifecycle_state === "stopped";
          const isLoading = actionLoading === env.id;
          const isTransitioning =
            isLoading || env.lifecycle_state === "starting" || env.lifecycle_state === "stopping";

          return (
            <div
              key={env.id}
              className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isRunning
                  ? "border-emerald-500/30 hover:border-emerald-500/50"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="space-y-3">
                {/* Header: Name & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {env.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1.5">
                        {env.ec2_instance_id}
                        <button
                          onClick={() => handleCopy(env.ec2_instance_id)}
                          className="hover:text-cyan-400 transition"
                          title="Copy EC2 ID"
                        >
                          {copiedId === env.ec2_instance_id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </span>
                    </div>
                  </div>

                  {/* Lifecycle State Pill */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase ${
                        isRunning
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 glow-emerald"
                          : isTransitioning
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isRunning
                            ? "bg-emerald-500"
                            : isTransitioning
                            ? "bg-amber-400 animate-ping"
                            : "bg-slate-500"
                        }`}
                      ></span>
                      {isTransitioning ? (isLoading ? "PROCESSING..." : env.lifecycle_state) : env.lifecycle_state}
                    </span>

                    {/* Application Readiness (PRD Sec 2.2) */}
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        env.app_health_status === "ready"
                          ? "text-cyan-400 bg-cyan-950/40 border border-cyan-800/40"
                          : "text-slate-400 bg-slate-900"
                      }`}
                    >
                      App: <strong className="capitalize">{env.app_health_status}</strong>
                    </span>
                  </div>
                </div>

                {/* Description */}
                {env.description && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {env.description}
                  </p>
                )}

                {/* Instance Specifications */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Instance Type</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1">
                      <Cpu className="h-3 w-3 text-cyan-400" />
                      {env.instance_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">AWS Region</span>
                    <span className="font-semibold text-slate-200">
                      {env.region}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Team / Owner</span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {env.team}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Indicative Rate</span>
                    <span className="font-semibold text-amber-400">
                      ${env.hourly_rate}/hr (~${(env.hourly_rate * 730).toFixed(1)}/mo)
                    </span>
                  </div>
                </div>

                {/* Connected App URLs */}
                {env.app_urls && env.app_urls.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      Associated Test Applications:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {env.app_urls.map((app, idx) => (
                        <a
                          key={idx}
                          href={app.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/40 text-cyan-300 text-xs transition"
                        >
                          <span>{app.name}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Last Op Info + Action Controls */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                  <span>Last: </span>
                  <strong className="text-slate-300">{env.last_operation}</strong> by{" "}
                  <span className="text-slate-400">{env.last_operator?.split("@")[0]}</span>
                </div>

                {/* Start / Stop Toggle Button */}
                <button
                  onClick={() => {
                    if (isRunning) {
                      setStopConfirmEnv(env); // Open confirmation modal for stop
                    } else {
                      handleStartClick(env);
                    }
                  }}
                  disabled={isTransitioning}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer ${
                    isRunning
                      ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 hover:shadow-rose-500/10"
                      : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 hover:shadow-emerald-500/10"
                  } ${isTransitioning ? "opacity-50 cursor-wait" : ""}`}
                >
                  {isTransitioning ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : isRunning ? (
                    <>
                      <Square className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                      <span>Stop VM</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" />
                      <span>Start VM</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for STOP Operation (PRD Sec 2.2 requirement) */}
      {stopConfirmEnv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Confirm EC2 Stop Operation
                </h3>
                <p className="text-xs text-slate-400">
                  {stopConfirmEnv.name} ({stopConfirmEnv.ec2_instance_id})
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                Stopping this instance will safely shut down running services. Attached EBS storage will be preserved.
              </p>
              <div className="text-[11px] text-amber-300 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                This action will be logged in the permanent audit trail under your Zoho account.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStopConfirmEnv(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStop}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition cursor-pointer"
              >
                Confirm & Stop Instance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Environment Modal (PRD Sec 2.2 / Sec 8) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Register New Cloud Environment
                  </h3>
                  <p className="text-xs text-slate-400">
                    Map a dedicated AWS EC2 instance to the IEMP platform
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Environment Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Payments Gateway Staging"
                    value={newEnvName}
                    onChange={(e) => setNewEnvName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">AWS EC2 Instance ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. i-078a9c12df8b103e4"
                    value={newEnvEc2Id}
                    onChange={(e) => setNewEnvEc2Id(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Region</label>
                  <select
                    value={newEnvRegion}
                    onChange={(e) => setNewEnvRegion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="us-east-1">us-east-1 (N. Virginia)</option>
                    <option value="us-west-2">us-west-2 (Oregon)</option>
                    <option value="eu-west-1">eu-west-1 (Ireland)</option>
                    <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Instance Type</label>
                  <input
                    type="text"
                    value={newEnvType}
                    onChange={(e) => setNewEnvType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Rate ($/hr)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={newEnvRate}
                    onChange={(e) => setNewEnvRate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Team / Department</label>
                <input
                  type="text"
                  value={newEnvTeam}
                  onChange={(e) => setNewEnvTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Purpose of this environment, deployed containers, or test suite..."
                  value={newEnvDesc}
                  onChange={(e) => setNewEnvDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition"
                >
                  Save & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

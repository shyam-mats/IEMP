"use client";

import React from "react";
import {
  Server,
  Compass,
  CircleDollarSign,
  ScrollText,
  Play,
  Square,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Environment, ApplicationTile, CostSummary, AuditEvent, User } from "@/lib/api";
import { TabKey } from "./SidebarNav";

interface DashboardViewProps {
  environments: Environment[];
  applications: ApplicationTile[];
  costSummary: CostSummary | null;
  recentAudit: AuditEvent[];
  currentUser: User | null;
  onNavigate: (tab: TabKey) => void;
  onToggleEnv: (env: Environment) => void;
  onLaunchApp: (app: ApplicationTile) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  environments,
  applications,
  costSummary,
  recentAudit,
  currentUser,
  onNavigate,
  onToggleEnv,
  onLaunchApp,
}) => {
  const runningEnvs = environments.filter((e) => e.lifecycle_state === "running");
  const stoppedEnvs = environments.filter((e) => e.lifecycle_state === "stopped");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-6 shadow-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Zap className="h-3.5 w-3.5" />
              <span>Self-Service Cloud Operations</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome back, {currentUser?.name || "Engineer"}
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              You are signed in as <strong className="text-slate-200 capitalize">{currentUser?.role?.replace("_", " ")}</strong>. Manage your assigned dedicated AWS EC2 instances, launch testing tools, and monitor cloud expenditure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("environments")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <Server className="h-4 w-4" />
              Manage Environments
            </button>
            <button
              onClick={() => onNavigate("costing")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition cursor-pointer"
            >
              <CircleDollarSign className="h-4 w-4 text-amber-400" />
              FinOps Overview
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Running Environments */}
        <div
          onClick={() => onNavigate("environments")}
          className="glass-panel glass-panel-hover p-4 rounded-xl cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Running Compute</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Server className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {runningEnvs.length}
            </span>
            <span className="text-xs text-slate-400">
              of {environments.length} total instances
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {stoppedEnvs.length} Stopped (Cost Optimized)
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>

        {/* Metric 2: Month-to-Date Cloud Spend */}
        <div
          onClick={() => onNavigate("costing")}
          className="glass-panel glass-panel-hover p-4 rounded-xl cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total MTD Cloud Spend</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <CircleDollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              ${costSummary ? costSummary.total_cost_mtd.toLocaleString() : "938.31"}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              -57.2% MoM
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
            <span className="text-slate-400">
              AWS: <strong className="text-slate-200">${costSummary?.aws_cost_mtd || 512}</strong> | GCP: <strong className="text-slate-200">${costSummary?.gcp_cost_mtd || 425}</strong>
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>

        {/* Metric 3: Testing Applications Launcher */}
        <div
          onClick={() => onNavigate("applications")}
          className="glass-panel glass-panel-hover p-4 rounded-xl cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Approved Testing Tools</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {applications.length}
            </span>
            <span className="text-xs text-slate-400">Tiles Active</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
            <span className="text-cyan-400 font-medium">100% Health SLA Pass</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>

        {/* Metric 4: Security & Audit Events */}
        <div
          onClick={() => onNavigate("audit")}
          className="glass-panel glass-panel-hover p-4 rounded-xl cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Audit Trail Events</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ScrollText className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {recentAudit.length}
            </span>
            <span className="text-xs text-slate-400">Logged Events</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
              Zoho SSO Traceable
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Main Grid: Assigned Environments Quick Action + Testing Tools Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Assigned Environments Cockpit */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-400" />
              <h2 className="font-semibold text-white text-sm">
                Assigned Cloud Environments (AWS EC2)
              </h2>
            </div>
            <button
              onClick={() => onNavigate("environments")}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              View All ({environments.length})
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {environments.slice(0, 3).map((env) => {
              const isRunning = env.lifecycle_state === "running";
              const isTransitioning =
                env.lifecycle_state === "starting" || env.lifecycle_state === "stopping";

              return (
                <div
                  key={env.id}
                  className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-white text-sm">
                        {env.name}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {env.ec2_instance_id}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isRunning
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : isTransitioning
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {env.lifecycle_state.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Type: <strong className="text-slate-200">{env.instance_type}</strong></span>
                      <span>Region: <strong className="text-slate-200">{env.region}</strong></span>
                      <span>Team: <strong className="text-slate-200">{env.team}</strong></span>
                      <span>Rate: <strong className="text-slate-200">${env.hourly_rate}/hr</strong></span>
                    </div>

                    {env.app_urls && env.app_urls.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 text-[11px]">
                        <span className="text-slate-400">Apps:</span>
                        {env.app_urls.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:underline flex items-center gap-1"
                          >
                            {link.name}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Start/Stop Button */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onToggleEnv(env)}
                      disabled={isTransitioning}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition cursor-pointer ${
                        isRunning
                          ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                          : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <Square className="h-3 w-3 fill-rose-400 text-rose-400" />
                          Stop Instance
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-emerald-400 text-emerald-400" />
                          Start Instance
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Quick Tool Launcher & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Launch Testing Tools */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-cyan-400" />
                <h3 className="font-semibold text-white text-xs uppercase tracking-wider">
                  Quick Testing Tools
                </h3>
              </div>
              <button
                onClick={() => onNavigate("applications")}
                className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                All Tools
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {applications.slice(0, 4).map((tile) => (
                <div
                  key={tile.id}
                  onClick={() => onLaunchApp(tile)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="p-1.5 rounded-md bg-blue-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition">
                      <Compass className="h-3.5 w-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-white truncate">
                        {tile.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {tile.category}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Activities */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-cyan-400" />
                <h3 className="font-semibold text-white text-xs uppercase tracking-wider">
                  Recent Audit Logs
                </h3>
              </div>
              <button
                onClick={() => onNavigate("audit")}
                className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
              >
                Full Trail
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {recentAudit.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-[11px] space-y-0.5"
                >
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-cyan-300">
                      {event.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {event.timestamp ? new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </span>
                  </div>
                  <div className="text-slate-400 truncate">
                    By: <strong className="text-slate-300">{event.actor_email}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

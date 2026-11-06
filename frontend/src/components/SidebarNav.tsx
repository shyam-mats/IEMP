"use client";

import React from "react";
import {
  LayoutDashboard,
  Server,
  Compass,
  Presentation,
  Film,
  CircleDollarSign,
  ScrollText,
  Settings,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { User } from "@/lib/api";

export type TabKey =
  | "dashboard"
  | "environments"
  | "applications"
  | "presentations"
  | "videos"
  | "costing"
  | "audit"
  | "admin";

interface SidebarNavProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  currentUser: User | null;
  runningCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  runningCount,
}) => {
  const role = currentUser?.role || "developer_tester";

  // Check if role has access to specific tabs
  const isTabAllowed = (tab: TabKey) => {
    if (role === "super_admin") return true;
    if (tab === "admin") return role === "env_admin";
    if (tab === "costing") return role === "finops" || role === "env_admin";
    if (tab === "audit") return role === "env_admin" || role === "finops";
    return true;
  };

  const navItems = [
    {
      key: "dashboard" as TabKey,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
      desc: "Executive overview & shortcuts",
    },
    {
      key: "environments" as TabKey,
      label: "Environments",
      icon: Server,
      badge: runningCount > 0 ? `${runningCount} Active` : null,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      desc: "Dedicated AWS EC2 instances",
    },
    {
      key: "applications" as TabKey,
      label: "Testing Tools",
      icon: Compass,
      badge: "6 Apps",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      desc: "Configurable application launcher",
    },
    {
      key: "presentations" as TabKey,
      label: "PPT Catalog",
      icon: Presentation,
      badge: "4 Decks",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      desc: "Searchable architecture decks",
    },
    {
      key: "videos" as TabKey,
      label: "Video Catalog",
      icon: Film,
      badge: "3 Videos",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      desc: "Internal demos & walkthroughs",
    },
    {
      key: "costing" as TabKey,
      label: "Cloud Costing",
      icon: CircleDollarSign,
      badge: "AWS + GCP",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      desc: "Multi-cloud FinOps analytics",
    },
    {
      key: "audit" as TabKey,
      label: "Audit Trail",
      icon: ScrollText,
      badge: null,
      desc: "Security & operation logs",
    },
    {
      key: "admin" as TabKey,
      label: "Administration",
      icon: Settings,
      badge: role === "super_admin" ? "Master" : null,
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      desc: "RBAC, Zoho users & settings",
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950/50 backdrop-blur-md flex flex-col justify-between p-4">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Platform Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const allowed = isTabAllowed(item.key);
              const isActive = activeTab === item.key;
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  disabled={!allowed}
                  onClick={() => allowed && onSelectTab(item.key)}
                  className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    !allowed
                      ? "opacity-35 cursor-not-allowed text-slate-500"
                      : isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-white font-semibold border border-blue-500/30 shadow-sm shadow-blue-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <div className="text-left">
                      <div className="leading-none">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate max-w-[130px]">
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border ${
                          item.badgeColor || "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight className="h-3 w-3 text-cyan-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Cloud Security Policy Notice Footer */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-2 font-semibold text-slate-300 mb-1">
          <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />
          <span>Security Enforced</span>
        </div>
        <p className="leading-relaxed text-[10px]">
          All EC2 start/stop operations are logged to the append-only audit trail with actor IP.
        </p>
      </div>
    </aside>
  );
};

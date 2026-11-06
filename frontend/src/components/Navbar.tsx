"use client";

import React, { useState } from "react";
import { User } from "@/lib/api";
import {
  ShieldCheck,
  Cloud,
  ChevronDown,
  UserCheck,
  LogOut,
  Sparkles,
  Server,
  Activity,
  Layers,
} from "lucide-react";

interface NavbarProps {
  currentUser: User | null;
  onSwitchRole: (role: string) => void;
  runningCount: number;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  runningCount,
  totalCount,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roles = [
    { key: "super_admin", label: "Super Admin (Full Access)" },
    { key: "env_admin", label: "Environment Admin" },
    { key: "developer_tester", label: "Developer / Tester" },
    { key: "finops", label: "FinOps / Cost Viewer" },
    { key: "content_manager", label: "Content Manager" },
    { key: "viewer", label: "Viewer (Read Only)" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo & Platform Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Server className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-lg">
                IEMP
              </span>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-400 border border-cyan-500/20">
                v1.1 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Internal Environment Management Platform
            </p>
          </div>
        </div>

        {/* Center Live Cloud Health Badges */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">AWS US-East-1</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-semibold">Boto3 Connected</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
            <span className="text-slate-300 font-medium">GCP BigQuery</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-semibold">Active</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <Activity className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-slate-300">Compute:</span>
            <span className="text-white font-semibold">
              {runningCount} <span className="text-slate-500">/ {totalCount} VMs Online</span>
            </span>
          </div>
        </div>

        {/* Right Section: Role Simulator & Zoho Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher (For testing/demoing all 6 PRD roles) */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/30 text-xs font-medium text-blue-300 hover:border-blue-400 transition"
              title="Switch demo persona to test role permissions"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Role: <strong className="text-white capitalize">{currentUser?.role?.replace("_", " ") || "Loading..."}</strong></span>
              <ChevronDown className="h-3 w-3 text-blue-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 p-2 shadow-2xl z-50">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Simulate Role Persona
                </div>
                {roles.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => {
                      onSwitchRole(r.key);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition ${
                      currentUser?.role === r.key
                        ? "bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span>{r.label}</span>
                    {currentUser?.role === r.key && (
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Zoho SSO Card */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            >
              <div className="relative">
                <img
                  src={
                    currentUser?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  }
                  alt={currentUser?.name || "User"}
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="font-semibold text-white truncate max-w-[120px]">
                  {currentUser?.name || "Shyam Tyagi"}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-cyan-400 inline" />
                  Zoho SSO
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 p-3 shadow-2xl z-50">
                <div className="pb-3 border-b border-slate-800">
                  <div className="font-semibold text-sm text-white">
                    {currentUser?.name}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {currentUser?.email}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                    <UserCheck className="h-3 w-3" />
                    Zoho Authenticated
                  </div>
                </div>
                <div className="pt-2 text-xs text-slate-400 space-y-1">
                  <div>Department: <strong className="text-slate-200">{currentUser?.department}</strong></div>
                  <div>ID: <strong className="text-slate-200">{currentUser?.zoho_id || "EMP-1001"}</strong></div>
                </div>
                <button
                  onClick={() => {
                    alert("Zoho SSO Session active. Use role switcher to test personas.");
                    setUserMenuOpen(false);
                  }}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

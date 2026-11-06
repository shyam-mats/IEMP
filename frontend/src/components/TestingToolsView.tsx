"use client";

import React, { useState } from "react";
import {
  Compass,
  ExternalLink,
  Plus,
  Search,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  CreditCard,
  Radio,
  FileCode2,
  Cpu,
  Database,
  Mail,
  X,
  Layers,
} from "lucide-react";
import { ApplicationTile, User } from "@/lib/api";

interface TestingToolsViewProps {
  applications: ApplicationTile[];
  currentUser: User | null;
  onLaunch: (app: ApplicationTile) => void;
  onCheckHealth: (id: number) => Promise<void>;
  onCreateTile: (data: Partial<ApplicationTile>) => Promise<void>;
}

export const TestingToolsView: React.FC<TestingToolsViewProps> = ({
  applications,
  currentUser,
  onLaunch,
  onCheckHealth,
  onCreateTile,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Tile Form State
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Core Services");
  const [newDesc, setNewDesc] = useState("");
  const [newHealthUrl, setNewHealthUrl] = useState("");

  const categories = ["All", "Core Services", "Observability", "APIs", "Simulators", "QA Tools"];
  const canManage = currentUser?.role === "super_admin" || currentUser?.role === "env_admin";

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "CreditCard":
        return <CreditCard className="h-5 w-5 text-cyan-400" />;
      case "Radio":
        return <Radio className="h-5 w-5 text-indigo-400" />;
      case "FileCode2":
        return <FileCode2 className="h-5 w-5 text-emerald-400" />;
      case "Cpu":
        return <Cpu className="h-5 w-5 text-amber-400" />;
      case "Database":
        return <Database className="h-5 w-5 text-rose-400" />;
      case "Mail":
        return <Mail className="h-5 w-5 text-purple-400" />;
      default:
        return <Layers className="h-5 w-5 text-cyan-400" />;
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) {
      alert("Name and URL are required.");
      return;
    }
    try {
      await onCreateTile({
        name: newName,
        url: newUrl,
        category: newCategory,
        description: newDesc,
        health_check_url: newHealthUrl || newUrl,
        icon: "Layers",
        access_policy: "all_authenticated",
      });
      setIsAddModalOpen(false);
      setNewName("");
      setNewUrl("");
      setNewDesc("");
    } catch (err: any) {
      alert(`Failed to add application tile: ${err.message}`);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Testing Application Launcher
            </h1>
            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
              {applications.length} Configured Tools
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Single-click access to approved internal testing frontends, simulators, event streams, and APIs.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Application Tile
          </button>
        )}
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer font-medium ${
                selectedCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="glass-panel p-2 rounded-xl border border-slate-800 flex items-center gap-2 min-w-[220px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tools & simulators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-white text-xs w-full focus:outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((tile) => (
          <div
            key={tile.id}
            className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 group-hover:border-cyan-500/30 transition">
                  {getIcon(tile.icon)}
                </div>

                {/* Health Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Healthy</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition">
                  {tile.name}
                </h3>
                <span className="text-[10px] font-medium text-cyan-400/90 tracking-wider uppercase">
                  {tile.category}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {tile.description}
              </p>

              <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded truncate border border-slate-800/80">
                {tile.url}
              </div>
            </div>

            {/* Launch Button */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Policy: <strong className="text-slate-400">{tile.access_policy}</strong>
              </span>

              <button
                onClick={() => onLaunch(tile)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                <span>Launch Tool</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Tool Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Add Testing Application Tile
                  </h3>
                  <p className="text-xs text-slate-400">
                    Register an internal tool to the self-service launcher
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Application Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Redis Cluster Commander"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Target URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://tool-name.internal.local"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Core Services">Core Services</option>
                    <option value="Observability">Observability</option>
                    <option value="APIs">APIs</option>
                    <option value="Simulators">Simulators</option>
                    <option value="QA Tools">QA Tools</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Health Check URL</label>
                  <input
                    type="text"
                    placeholder="https://.../healthz"
                    value={newHealthUrl}
                    onChange={(e) => setNewHealthUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the tool, credentials, or mock behavior..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 transition"
                >
                  Create Tile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

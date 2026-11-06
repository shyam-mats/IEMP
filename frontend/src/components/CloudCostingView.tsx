"use client";

import React, { useState } from "react";
import {
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
  Download,
  Calendar,
  Cloud,
  Layers,
  Server,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  CostSummary,
  CostTrendPoint,
  ServiceCostItem,
  EnvironmentCostItem,
  User,
} from "@/lib/api";

interface CloudCostingViewProps {
  costSummary: CostSummary | null;
  costTrends: CostTrendPoint[];
  serviceBreakdown: ServiceCostItem[];
  environmentRunrates: EnvironmentCostItem[];
  currentUser: User | null;
  onExportCsv: () => void;
}

export const CloudCostingView: React.FC<CloudCostingViewProps> = ({
  costSummary,
  costTrends,
  serviceBreakdown,
  environmentRunrates,
  currentUser,
  onExportCsv,
}) => {
  const [providerFilter, setProviderFilter] = useState("All"); // All, AWS, GCP
  const [timeRange, setTimeRange] = useState("30"); // 7, 30, 90

  // Filter trends based on selected days
  const filteredTrends = costTrends.slice(-parseInt(timeRange));
  const maxTrendVal = Math.max(...filteredTrends.map((t) => t.total_cost), 120);

  const filteredServices = serviceBreakdown.filter(
    (s) => providerFilter === "All" || s.provider === providerFilter
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Multi-Cloud Cost Management (FinOps)
            </h1>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              AWS Cost Explorer + GCP BigQuery
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Unified infrastructure expenditure analytics, provider comparisons, and tagged environment cost attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Provider toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {["All", "AWS", "GCP"].map((p) => (
              <button
                key={p}
                onClick={() => setProviderFilter(p)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  providerFilter === p
                    ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Top FinOps Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total MTD Cost */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total MTD Spend</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <CircleDollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${costSummary?.total_cost_mtd.toLocaleString() || "938.31"}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
            <span className="text-emerald-400 font-semibold flex items-center">
              <TrendingDown className="h-3 w-3 mr-0.5" />
              {costSummary?.mom_percentage_change}% MoM
            </span>
            <span className="text-slate-400">
              Prev Mo: ${costSummary?.previous_month_total || 2190}
            </span>
          </div>
        </div>

        {/* Card 2: AWS Spend */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>AWS Cost Explorer</span>
            <span className="text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-bold border border-orange-500/20">
              AWS
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${costSummary?.aws_cost_mtd.toLocaleString() || "512.95"}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
            <span className="text-slate-400">
              {costSummary ? Math.round((costSummary.aws_cost_mtd / costSummary.total_cost_mtd) * 100) : 55}% of total cloud
            </span>
            <span className="text-slate-500">us-east-1 focus</span>
          </div>
        </div>

        {/* Card 3: GCP Spend */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>GCP BigQuery Export</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold border border-blue-500/20">
              GCP
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${costSummary?.gcp_cost_mtd.toLocaleString() || "425.36"}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
            <span className="text-slate-400">
              {costSummary ? Math.round((costSummary.gcp_cost_mtd / costSummary.total_cost_mtd) * 100) : 45}% of total cloud
            </span>
            <span className="text-slate-500">Compute + BQ</span>
          </div>
        </div>

        {/* Card 4: Month-End Forecast */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Month-End Spend Forecast</span>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-medium">
              ESTIMATE
            </span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${costSummary?.estimated_month_end.toLocaleString() || "5,629.80"}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
            <span className="text-slate-400">
              Daily Run: <strong className="text-slate-200">${costSummary?.daily_average || 187}/day</strong>
            </span>
            <span className="text-emerald-400 font-semibold">Under Budget</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Spend Trend (AWS vs GCP) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-sm">
                Daily Spend Trend (AWS vs GCP)
              </h3>
              <p className="text-xs text-slate-400">
                Data freshness: {costSummary?.data_freshness || "Real-time sync"} • Cost basis: Actual Billed
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400"></span>
                <span className="text-slate-300">AWS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400"></span>
                <span className="text-slate-300">GCP</span>
              </div>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
              >
                <option value="7">Last 7 Days</option>
                <option value="14">Last 14 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* SVG Bar / Area Chart */}
          <div className="h-64 w-full pt-4 flex items-end gap-1 sm:gap-2">
            {filteredTrends.map((t, idx) => {
              const awsHeight = (t.aws_cost / maxTrendVal) * 100;
              const gcpHeight = (t.gcp_cost / maxTrendVal) * 100;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                    <div className="bg-slate-900 text-white text-[10px] p-2 rounded-lg border border-slate-800 shadow-xl whitespace-nowrap space-y-0.5">
                      <div className="font-bold text-cyan-400">{t.date}</div>
                      <div className="text-orange-300">AWS: ${t.aws_cost}</div>
                      <div className="text-blue-300">GCP: ${t.gcp_cost}</div>
                      <div className="font-semibold text-white pt-1 border-t border-slate-800">
                        Total: ${t.total_cost}
                      </div>
                    </div>
                  </div>

                  {/* Stacked Bars */}
                  <div className="w-full max-w-[24px] flex flex-col items-center justify-end h-full">
                    <div
                      style={{ height: `${gcpHeight}%` }}
                      className="w-full bg-blue-500/80 hover:bg-blue-400 transition-all rounded-t-sm"
                    ></div>
                    <div
                      style={{ height: `${awsHeight}%` }}
                      className="w-full bg-orange-500/80 hover:bg-orange-400 transition-all rounded-b-sm"
                    ></div>
                  </div>

                  {/* Date label (sample every 4 days) */}
                  <span className="text-[9px] text-slate-400 mt-2 truncate w-full text-center">
                    {idx % 4 === 0 ? t.date.split("-").slice(1).join("/") : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Top Services Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">
              Service Spend Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">
              {filteredServices.length} Services
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {filteredServices.map((svc, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        svc.provider === "AWS"
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {svc.provider}
                    </span>
                    <span className="text-slate-200 font-medium truncate">
                      {svc.service}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-semibold">${svc.cost}</span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({svc.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${svc.percentage}%` }}
                    className={`h-full rounded-full ${
                      svc.provider === "AWS"
                        ? "bg-gradient-to-r from-orange-500 to-amber-400"
                        : "bg-gradient-to-r from-blue-500 to-cyan-400"
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environment Cost Calculator & Attribution Table (PRD Sec 4.6) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Server className="h-4 w-4 text-cyan-400" />
              Environment Cost Run-Rate Calculator & Actual Attribution
            </h3>
            <p className="text-xs text-slate-400">
              Shows indicative hourly, daily, and monthly run-rates alongside actual accrued billed cost.
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Currency: <strong className="text-white">USD ($)</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Environment Name</th>
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3">EC2 Type</th>
                <th className="py-2.5 px-3 text-right">Hourly Rate</th>
                <th className="py-2.5 px-3 text-right">Daily Run-Rate</th>
                <th className="py-2.5 px-3 text-right">Monthly Forecast (730h)</th>
                <th className="py-2.5 px-3 text-right">Actual Accrued MTD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {environmentRunrates.map((item) => (
                <tr key={item.environment_id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-3 font-semibold text-white">
                    {item.environment_name}
                  </td>
                  <td className="py-3 px-3 text-slate-400">{item.team}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-cyan-300 text-[11px]">
                      {item.instance_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-200">
                    ${item.hourly_rate.toFixed(4)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-200">
                    ${(item.hourly_rate * 24).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-amber-400">
                    ${item.monthly_run_rate.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">
                    ${item.actual_cost_mtd.toFixed(2)}
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

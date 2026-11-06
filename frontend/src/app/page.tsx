"use client";

import React, { useState, useEffect } from "react";
import {
  api,
  User,
  Environment,
  ApplicationTile,
  Presentation,
  Video,
  CostSummary,
  CostTrendPoint,
  ServiceCostItem,
  EnvironmentCostItem,
  AuditEvent,
} from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { SidebarNav, TabKey } from "@/components/SidebarNav";
import { DashboardView } from "@/components/DashboardView";
import { EnvironmentsView } from "@/components/EnvironmentsView";
import { TestingToolsView } from "@/components/TestingToolsView";
import { PPTCatalogView } from "@/components/PPTCatalogView";
import { VideoCatalogView } from "@/components/VideoCatalogView";
import { CloudCostingView } from "@/components/CloudCostingView";
import { AuditTrailView } from "@/components/AuditTrailView";
import { AdminView } from "@/components/AdminView";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [applications, setApplications] = useState<ApplicationTile[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [costTrends, setCostTrends] = useState<CostTrendPoint[]>([]);
  const [serviceBreakdown, setServiceBreakdown] = useState<ServiceCostItem[]>([]);
  const [environmentRunrates, setEnvironmentRunrates] = useState<EnvironmentCostItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // safe fallback
    }
  };

  const loadAllData = async () => {
    try {
      const [
        meData,
        envsData,
        appsData,
        pptsData,
        vidsData,
        summaryData,
        trendsData,
        servicesData,
        runratesData,
        auditData,
        allUsersData,
      ] = await Promise.all([
        api.getMe().catch(() => null),
        api.listEnvironments().catch(() => []),
        api.listApplications().catch(() => []),
        api.listPresentations().catch(() => []),
        api.listVideos().catch(() => []),
        api.getCostSummary().catch(() => null),
        api.getCostTrends().catch(() => []),
        api.getServiceBreakdown().catch(() => []),
        api.getEnvironmentCostRunrates().catch(() => []),
        api.listAudit().catch(() => []),
        api.listUsers().catch(() => []),
      ]);

      if (meData) setCurrentUser(meData);
      setEnvironments(envsData);
      setApplications(appsData);
      setPresentations(pptsData);
      setVideos(vidsData);
      setCostSummary(summaryData);
      setCostTrends(trendsData);
      setServiceBreakdown(servicesData);
      setEnvironmentRunrates(runratesData);
      setAuditEvents(auditData);
      setUsersList(allUsersData);
    } catch (err) {
      console.error("Error loading IEMP data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleSwitchRole = async (role: string) => {
    try {
      const res = await api.switchRole(role);
      setCurrentUser(res.user);
      showToast(res.message);
      // Reload environments and audit based on new role
      const [envs, audit] = await Promise.all([
        api.listEnvironments(),
        api.listAudit(),
      ]);
      setEnvironments(envs);
      setAuditEvents(audit);
    } catch (err: any) {
      showToast(`Role switch failed: ${err.message}`);
    }
  };

  const handleStartEnvironment = async (id: number) => {
    const res = await api.startEnvironment(id);
    showToast(res.message);
    triggerConfetti();
    await loadAllData();
  };

  const handleStopEnvironment = async (id: number) => {
    const res = await api.stopEnvironment(id);
    showToast(res.message);
    await loadAllData();
  };

  const handleCreateEnvironment = async (data: Partial<Environment>) => {
    const newEnv = await api.createEnvironment(data);
    showToast(`Environment '${newEnv.name}' successfully registered.`);
    triggerConfetti();
    await loadAllData();
  };

  const handleLaunchApp = async (app: ApplicationTile) => {
    try {
      await api.launchApplication(app.id);
      window.open(app.url, "_blank");
      showToast(`Launched ${app.name} in a new tab.`);
      const updatedAudit = await api.listAudit();
      setAuditEvents(updatedAudit);
    } catch (err: any) {
      window.open(app.url, "_blank");
    }
  };

  const handleCheckHealth = async (id: number) => {
    const res = await api.checkAppHealth(id);
    showToast(`Health check response: ${res.message || res.status}`);
    const updatedApps = await api.listApplications();
    setApplications(updatedApps);
  };

  const handleCreateAppTile = async (data: Partial<ApplicationTile>) => {
    await api.createApplication(data);
    showToast("Application tile created successfully.");
    const updatedApps = await api.listApplications();
    setApplications(updatedApps);
  };

  const handleDownloadPPT = async (id: number) => {
    const res = await api.downloadPresentation(id);
    showToast(`Downloading presentation: ${res.filename}`);
    const updatedAudit = await api.listAudit();
    setAuditEvents(updatedAudit);
  };

  const handleUploadPPT = async (data: any) => {
    await api.uploadPresentation(data);
    showToast("Presentation cataloged successfully.");
    const updatedPPTs = await api.listPresentations();
    setPresentations(updatedPPTs);
  };

  const handleViewVideo = async (id: number) => {
    await api.viewVideo(id);
    const updatedVideos = await api.listVideos();
    setVideos(updatedVideos);
  };

  const handleExportCosts = () => {
    window.open(api.getCostExportUrl(), "_blank");
    showToast("Exporting multi-cloud cost data as CSV.");
  };

  const handleExportAudit = () => {
    window.open(api.getAuditExportUrl(), "_blank");
    showToast("Exporting append-only audit trail as CSV.");
  };

  const handleUpdateRole = async (userId: number, role: string) => {
    await api.updateUserRole(userId, role);
    showToast("User role updated successfully.");
    const updatedUsers = await api.listUsers();
    setUsersList(updatedUsers);
  };

  const handleApproveUser = async (userId: number) => {
    await api.approveUser(userId);
    showToast("User access approved.");
    const updatedUsers = await api.listUsers();
    setUsersList(updatedUsers);
  };

  const runningCount = environments.filter((e) => e.lifecycle_state === "running").length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 space-y-4">
        <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
        <div className="font-semibold text-sm tracking-wide">
          Initializing Internal Environment Management Platform...
        </div>
        <p className="text-xs text-slate-400">
          Validating Zoho SSO session & loading AWS/GCP clusters
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 border border-cyan-500/40 px-4 py-2.5 text-xs text-cyan-200 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        runningCount={runningCount}
        totalCount={environments.length}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentUser={currentUser}
          runningCount={runningCount}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <DashboardView
                environments={environments}
                applications={applications}
                costSummary={costSummary}
                recentAudit={auditEvents}
                currentUser={currentUser}
                onNavigate={setActiveTab}
                onToggleEnv={(env) =>
                  env.lifecycle_state === "running"
                    ? handleStopEnvironment(env.id)
                    : handleStartEnvironment(env.id)
                }
                onLaunchApp={handleLaunchApp}
              />
            )}

            {activeTab === "environments" && (
              <EnvironmentsView
                environments={environments}
                currentUser={currentUser}
                onStart={handleStartEnvironment}
                onStop={handleStopEnvironment}
                onCreate={handleCreateEnvironment}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === "applications" && (
              <TestingToolsView
                applications={applications}
                currentUser={currentUser}
                onLaunch={handleLaunchApp}
                onCheckHealth={handleCheckHealth}
                onCreateTile={handleCreateAppTile}
              />
            )}

            {activeTab === "presentations" && (
              <PPTCatalogView
                presentations={presentations}
                currentUser={currentUser}
                onDownload={handleDownloadPPT}
                onUpload={handleUploadPPT}
              />
            )}

            {activeTab === "videos" && (
              <VideoCatalogView
                videos={videos}
                currentUser={currentUser}
                onViewVideo={handleViewVideo}
              />
            )}

            {activeTab === "costing" && (
              <CloudCostingView
                costSummary={costSummary}
                costTrends={costTrends}
                serviceBreakdown={serviceBreakdown}
                environmentRunrates={environmentRunrates}
                currentUser={currentUser}
                onExportCsv={handleExportCosts}
              />
            )}

            {activeTab === "audit" && (
              <AuditTrailView
                auditEvents={auditEvents}
                currentUser={currentUser}
                onExportCsv={handleExportAudit}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === "admin" && (
              <AdminView
                users={usersList}
                currentUser={currentUser}
                onUpdateRole={handleUpdateRole}
                onApproveUser={handleApproveUser}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: number;
  zoho_id: string;
  email: string;
  name: string;
  role: "super_admin" | "env_admin" | "developer_tester" | "finops" | "content_manager" | "viewer";
  status: string;
  department: string;
  avatar?: string;
  last_login?: string;
}

export interface Environment {
  id: number;
  name: string;
  ec2_instance_id: string;
  region: string;
  instance_type: string;
  owner_email: string;
  team: string;
  description?: string;
  app_urls: Array<{ name: string; url: string }>;
  lifecycle_state: "running" | "stopped" | "pending" | "starting" | "stopping" | "failed";
  app_health_status: "ready" | "degraded" | "unreachable" | "checking";
  last_operation: string;
  last_operator: string;
  last_state_change?: string;
  uptime_hours: number;
  hourly_rate: number;
  is_locked: boolean;
  locked_by?: string;
}

export interface ApplicationTile {
  id: number;
  name: string;
  url: string;
  icon: string;
  category: string;
  description?: string;
  environment_id?: number;
  health_check_url?: string;
  health_status: "healthy" | "warning" | "down" | "unknown";
  access_policy: string;
  is_active: boolean;
}

export interface Presentation {
  id: number;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  uploader_name: string;
  uploader_email: string;
  upload_date: string;
  version: string;
  download_url: string;
  thumbnail_url?: string;
  slide_count: number;
  size_mb: number;
}

export interface Video {
  id: number;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  uploader_name: string;
  upload_date: string;
  duration_seconds: number;
  video_url: string;
  thumbnail_url?: string;
  view_count: number;
}

export interface CostSummary {
  aws_cost_mtd: number;
  gcp_cost_mtd: number;
  total_cost_mtd: number;
  previous_month_total: number;
  mom_percentage_change: number;
  daily_average: number;
  estimated_month_end: number;
  currency: string;
  cost_basis: string;
  data_freshness: string;
}

export interface CostTrendPoint {
  date: string;
  aws_cost: number;
  gcp_cost: number;
  total_cost: number;
}

export interface ServiceCostItem {
  provider: string;
  service: string;
  cost: number;
  percentage: number;
}

export interface EnvironmentCostItem {
  environment_id: number;
  environment_name: string;
  instance_type: string;
  hourly_rate: number;
  monthly_run_rate: number;
  actual_cost_mtd: number;
  team: string;
}

export interface AuditEvent {
  id: number;
  actor_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  timestamp: string;
  ip_address: string;
  status: string;
  details: Record<string, any>;
}

// Helper fetcher with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  getMe: () => fetchAPI<User>("/api/v1/auth/me"),
  switchRole: (role: string) =>
    fetchAPI<{ message: string; user: User }>(`/api/v1/auth/switch-role?role=${encodeURIComponent(role)}`, {
      method: "POST",
    }),

  // Environments
  listEnvironments: () => fetchAPI<Environment[]>("/api/v1/environments"),
  startEnvironment: (id: number) =>
    fetchAPI<{ status: string; message: string; environment: Environment }>(`/api/v1/environments/${id}/start`, {
      method: "POST",
    }),
  stopEnvironment: (id: number) =>
    fetchAPI<{ status: string; message: string; environment: Environment }>(`/api/v1/environments/${id}/stop`, {
      method: "POST",
    }),
  getEnvironmentHistory: (id: number) => fetchAPI<any[]>(`/api/v1/environments/${id}/history`),
  createEnvironment: (data: Partial<Environment>) =>
    fetchAPI<Environment>("/api/v1/environments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Applications
  listApplications: () => fetchAPI<ApplicationTile[]>("/api/v1/applications"),
  launchApplication: (id: number) =>
    fetchAPI<{ status: string; url: string }>(`/api/v1/applications/${id}/launch`, { method: "POST" }),
  checkAppHealth: (id: number) =>
    fetchAPI<any>(`/api/v1/applications/${id}/check-health`, { method: "POST" }),
  createApplication: (data: Partial<ApplicationTile>) =>
    fetchAPI<ApplicationTile>("/api/v1/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Presentations
  listPresentations: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (search) params.append("search", search);
    return fetchAPI<Presentation[]>(`/api/v1/presentations?${params.toString()}`);
  },
  downloadPresentation: (id: number) => fetchAPI<{ download_url: string; filename: string }>(`/api/v1/presentations/${id}/download`),
  uploadPresentation: (data: any) =>
    fetchAPI<Presentation>("/api/v1/presentations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Videos
  listVideos: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (search) params.append("search", search);
    return fetchAPI<Video[]>(`/api/v1/videos?${params.toString()}`);
  },
  viewVideo: (id: number) => fetchAPI<{ status: string; view_count: number }>(`/api/v1/videos/${id}/view`, { method: "POST" }),

  // Costs
  getCostSummary: (provider = "All") =>
    fetchAPI<CostSummary>(`/api/v1/costs/summary?provider=${provider}`),
  getCostTrends: (days = 30) => fetchAPI<CostTrendPoint[]>(`/api/v1/costs/trends?days=${days}`),
  getServiceBreakdown: (provider = "All") =>
    fetchAPI<ServiceCostItem[]>(`/api/v1/costs/services?provider=${provider}`),
  getEnvironmentCostRunrates: () => fetchAPI<EnvironmentCostItem[]>("/api/v1/costs/environments"),
  getCostExportUrl: () => `${API_BASE}/api/v1/costs/export`,

  // Audit
  listAudit: (actor?: string, action?: string, resourceType?: string, limit = 50) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (actor) params.append("actor", actor);
    if (action && action !== "All") params.append("action", action);
    if (resourceType && resourceType !== "All") params.append("resource_type", resourceType);
    return fetchAPI<AuditEvent[]>(`/api/v1/audit?${params.toString()}`);
  },
  getAuditExportUrl: () => `${API_BASE}/api/v1/audit/export`,

  // Admin
  listUsers: () => fetchAPI<User[]>("/api/v1/admin/users"),
  updateUserRole: (id: number, role: string) =>
    fetchAPI<User>(`/api/v1/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
  approveUser: (id: number) =>
    fetchAPI<{ message: string }>(`/api/v1/admin/users/${id}/approve`, { method: "POST" }),
};

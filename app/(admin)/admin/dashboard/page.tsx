
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";

import {
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  UserCheck,
  Activity,
  RefreshCw,
  TrendingUp,
  ClipboardList,
  ArrowUpRight,
} from "lucide-react";

import { getSystemStatsApi } from "@/lib/api-client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type SystemStats = {
  totalComplaints?: number;
  openComplaints?: number;
  resolvedComplaints?: number;
  avgResolutionHours?: number | null;
  totalStaff?: number;
  activeStaff?: number;
};

type StatCard = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
};

function StatCardItem({ item }: { item: StatCard }) {
  const Icon = item.icon;

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {item.title}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {item.value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {item.description}
          </p>
        </div>

        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border">
          <Icon className="size-5" strokeWidth={1.7} />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0 ? Math.min((value / total) * 100, 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {value} <span className="text-muted-foreground">({percentage.toFixed(1)}%)</span>
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ComplaintDistribution({
  total,
  open,
  resolved,
}: {
  total: number;
  open: number;
  resolved: number;
}) {
  const other = Math.max(total - open - resolved, 0);
  const circumference = 2 * Math.PI * 48;

  const segments = [
    { label: "Open", value: open, className: "text-foreground" },
    { label: "Resolved", value: resolved, className: "text-muted-foreground" },
    { label: "Other", value: other, className: "text-border" },
  ];

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
      <div className="relative size-44 shrink-0">
        <svg
          viewBox="0 0 112 112"
          className="size-full -rotate-90"
          role="img"
          aria-label="Complaint status distribution"
        >
          <circle
            cx="56"
            cy="56"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted"
          />

          {segments.map((segment) => {
            const length =
              total > 0
                ? (segment.value / total) * circumference
                : 0;

            const currentOffset = offset;
            offset += length;

            if (length === 0) return null;

            return (
              <circle
                key={segment.label}
                cx="56"
                cy="56"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-currentOffset}
                className={segment.className}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums">
            {total}
          </span>
          <span className="text-xs text-muted-foreground">
            Total complaints
          </span>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${
                  segment.label === "Open"
                    ? "bg-foreground"
                    : segment.label === "Resolved"
                      ? "bg-muted-foreground"
                      : "border border-border"
                }`}
              />
              <span className="text-sm text-muted-foreground">
                {segment.label}
              </span>
            </div>

            <span className="text-sm font-semibold tabular-nums">
              {segment.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplaintOverview({
  total,
  open,
  resolved,
}: {
  total: number;
  open: number;
  resolved: number;
}) {
  const resolutionRate =
    total > 0 ? (resolved / total) * 100 : 0;

  const pending = Math.max(total - open - resolved, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Resolution Overview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Current complaint resolution performance.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Resolution rate
          </p>

          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">
              {resolutionRate.toFixed(1)}%
            </span>
            <TrendingUp className="mb-2 size-4 text-muted-foreground" />
          </div>
        </div>

        <Separator />

        <MetricBar
          label="Resolved"
          value={resolved}
          total={total}
        />

        <MetricBar
          label="Open"
          value={open}
          total={total}
        />

        <MetricBar
          label="Pending / Other"
          value={pending}
          total={total}
        />
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSystemStatsApi();
      setStats(data);
    } catch (err) {
      console.error("Dashboard statistics error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const metrics = useMemo(() => {
    const total = stats?.totalComplaints ?? 0;
    const open = stats?.openComplaints ?? 0;
    const resolved = stats?.resolvedComplaints ?? 0;

    return {
      total,
      open,
      resolved,
      pending: Math.max(total - resolved, 0),
    };
  }, [stats]);

  const statCards: StatCard[] = [
    {
      title: "Total Complaints",
      value: metrics.total,
      description: "All submitted complaints",
      icon: MessageSquare,
    },
    {
      title: "Open Complaints",
      value: metrics.open,
      description: "Awaiting resolution",
      icon: AlertCircle,
    },
    {
      title: "Resolved",
      value: metrics.resolved,
      description: "Successfully resolved",
      icon: CheckCircle,
    },
    {
      title: "Avg. Resolution",
      value:
        stats?.avgResolutionHours != null
          ? `${stats.avgResolutionHours}h`
          : "N/A",
      description: "Average resolution time",
      icon: Clock,
    },
  ];

  if (loading && !stats) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center gap-3 text-sm text-muted-foreground">
        <RefreshCw className="size-4 animate-spin" />
        Loading system overview...
      </div>
    );
  }

  if (error && !stats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertCircle className="size-8" />

          <div>
            <h2 className="font-semibold">
              Dashboard unavailable
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {error}
            </p>
          </div>

          <Button variant="outline" onClick={fetchStats}>
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            System Overview
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor campus complaints, staff, and resolution performance.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Refresh failed: {error}
        </p>
      )}

      {/* Main Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <StatCardItem key={item.title} item={item} />
        ))}
      </section>

      {/* Analytics */}
      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">
              Complaint Distribution
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown of complaints by current status.
            </p>
          </CardHeader>

          <CardContent>
            <ComplaintDistribution
              total={metrics.total}
              open={metrics.open}
              resolved={metrics.resolved}
            />
          </CardContent>
        </Card>

        <div className="xl:col-span-2">
          <ComplaintOverview
            total={metrics.total}
            open={metrics.open}
            resolved={metrics.resolved}
          />
        </div>
      </section>

      {/* Staff and Operations */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              Staff Overview
            </CardTitle>
            <Users className="size-5 text-muted-foreground" />
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total staff
              </span>
              <span className="font-semibold tabular-nums">
                {stats?.totalStaff ?? "N/A"}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Active staff
              </span>
              <span className="font-semibold tabular-nums">
                {stats?.activeStaff ?? "N/A"}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Staff availability
              </span>
              <span className="font-semibold">
                {stats?.activeStaff != null &&
                stats?.totalStaff != null
                  ? `${stats.totalStaff > 0
                      ? ((stats.activeStaff / stats.totalStaff) * 100).toFixed(0)
                      : 0}%`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              Workload Overview
            </CardTitle>
            <ClipboardList className="size-5 text-muted-foreground" />
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-semibold tabular-nums">
                {metrics.pending}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Complaints not yet resolved
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Open complaints
              </span>
              <span className="font-medium">
                {metrics.open}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Resolved complaints
              </span>
              <span className="font-medium">
                {metrics.resolved}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              System Activity
            </CardTitle>
            <Activity className="size-5 text-muted-foreground" />
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Complaint records
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.total} recorded in the system
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border">
                <UserCheck className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Staff management
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalStaff != null
                    ? `${stats.totalStaff} registered staff`
                    : "Staff statistics not provided by API"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border">
                <ArrowUpRight className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Resolution progress
                </p>
                <p className="text-xs text-muted-foreground">
                  {metrics.total > 0
                    ? `${((metrics.resolved / metrics.total) * 100).toFixed(1)}% resolved`
                    : "No complaint records yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

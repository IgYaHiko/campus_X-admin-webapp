"use client";

import { useEffect, useState } from "react";
import { getSystemStatsApi } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSystemStatsApi();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10">Loading dashboard...</div>;

  const statCards = [
    {
      title: "Total Complaints",
      value: stats?.totalComplaints || 0,
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      title: "Open Complaints",
      value: stats?.openComplaints || 0,
      icon: AlertCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      title: "Resolved",
      value: stats?.resolvedComplaints || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Avg Resolution (Hours)",
      value: stats?.avgResolutionHours ? `${stats.avgResolutionHours}h` : "N/A",
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Overview</h1>
        <p className="text-slate-500">Monitor real-time campus maintenance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <h3 className="text-3xl font-bold mt-2">{card.value}</h3>
                </div>
                <div className={`p-4 rounded-full ${card.bg}`}>
                  <Icon className={`size-6 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
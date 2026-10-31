
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getStaffApi } from "@/lib/api-client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import {
  Users,
  UserRound,
  Mail,
  Search,
  RefreshCw,
  Loader2,
  ShieldCheck,
  AlertCircle,
  UserCog,
} from "lucide-react";

// --------------------------------------------------
// Types
// --------------------------------------------------

type StaffMember = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getRoleLabel(role?: string) {
  if (!role) return "Staff";

  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(name?: string) {
  if (!name) return "ST";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// --------------------------------------------------
// Staff Page
// --------------------------------------------------

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // Fetch staff
  // --------------------------------------------------

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getStaffApi();

      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
      setError("Unable to load staff directory. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredStaff = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return staff;

    return staff.filter((member) => {
      return (
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.role?.toLowerCase().includes(query)
      );
    });
  }, [staff, search]);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const adminCount = staff.filter(
    (member) => member.role?.toLowerCase() === "admin"
  ).length;

  const staffCount = staff.length - adminCount;

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-7">
      {/* Page Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Staff Directory
            </h1>

            <span className="rounded-md border px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {staff.length}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            View and manage personnel available for complaint assignment.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchStaff}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <OverviewCard
          title="Total Personnel"
          value={staff.length}
          icon={<Users className="h-4 w-4" />}
        />

        <OverviewCard
          title="Administrators"
          value={adminCount}
          icon={<ShieldCheck className="h-4 w-4" />}
        />

        <OverviewCard
          title="Staff Members"
          value={staffCount}
          icon={<UserCog className="h-4 w-4" />}
        />
      </div>

      {/* Staff Directory */}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold tracking-tight">
              All Personnel
            </h2>

            <p className="text-sm text-muted-foreground">
              {filteredStaff.length} members found
            </p>
          </div>

          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Error */}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-3">
              {error}

              <Button
                variant="outline"
                size="sm"
                onClick={fetchStaff}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading */}

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-lg border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading staff directory...
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          /* Empty State */

          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center">
            <div className="mb-4 rounded-full border p-4 text-muted-foreground">
              {search ? (
                <Search className="h-6 w-6" />
              ) : (
                <Users className="h-6 w-6" />
              )}
            </div>

            <h3 className="font-semibold">
              {search ? "No matching personnel" : "No staff found"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {search
                ? "Try searching with a different name, email, or role."
                : "There are currently no personnel available in the directory."}
            </p>

            {search && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearch("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          /* Staff Cards */

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStaff.map((member) => {
              const isAdmin =
                member.role?.toLowerCase() === "admin";

              return (
                <Card
                  key={member.id}
                  className="gap-4 py-5 transition-colors hover:border-primary/30"
                >
                  <CardContent className="space-y-5 px-5">
                    {/* Profile */}

                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-semibold">
                        {getInitials(member.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">
                          {member.name}
                        </h3>

                        <p className="truncate text-sm text-muted-foreground">
                          {getRoleLabel(member.role)}
                        </p>
                      </div>

                      <Badge variant="outline">
                        {isAdmin ? "Admin" : "Staff"}
                      </Badge>
                    </div>

                    {/* Divider */}

                    <div className="border-t" />

                    {/* Email */}

                    <div className="flex items-center gap-3">
                      <div className="rounded-md border p-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Email Address
                        </p>

                        <p className="truncate text-sm font-medium">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    {/* Role */}

                    <div className="flex items-center gap-3">
                      <div className="rounded-md border p-2 text-muted-foreground">
                        {isAdmin ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <UserRound className="h-4 w-4" />
                        )}
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Account Role
                        </p>

                        <p className="text-sm font-medium">
                          {getRoleLabel(member.role)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// --------------------------------------------------
// Overview Card
// --------------------------------------------------

function OverviewCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="gap-3 py-5">
      <CardContent className="flex items-center justify-between px-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <div className="rounded-md border p-2 text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

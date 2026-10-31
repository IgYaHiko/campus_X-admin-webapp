
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getAdminsApi, getStaffApi } from "@/lib/api-client";

import { Card, CardContent } from "@/components/ui/card";
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
  Building2,
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

type Admin = {
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
  if (!name) return "NA";

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
  const [admins, setAdmins] = useState<Admin[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // --------------------------------------------------
  // Fetch admins and staff together
  // --------------------------------------------------

  const fetchDirectory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [staffData, adminData] = await Promise.all([
        getStaffApi(),
        getAdminsApi(),
      ]);

      setStaff(Array.isArray(staffData) ? staffData : []);
      setAdmins(Array.isArray(adminData) ? adminData : []);
    } catch (err) {
      console.error("Failed to fetch directory:", err);
      setError("Unable to load the personnel directory. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredStaff = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return staff;

    return staff.filter((member) =>
      [
        member.name,
        member.email,
        member.role,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [staff, search]);

  const filteredAdmins = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return admins;

    return admins.filter((admin) =>
      [
        admin.name,
        admin.email,
        admin.role,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [admins, search]);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const totalPersonnel = staff.length + admins.length;

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-6">

      {/* Page Header */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Personnel
            </h1>

            <Badge variant="outline">
              {totalPersonnel} members
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Manage administrators and staff responsible for campus operations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchDirectory}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Overview */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <OverviewCard
          title="Total Personnel"
          value={totalPersonnel}
          description="All registered personnel"
          icon={<Users className="h-4 w-4" />}
        />

        <OverviewCard
          title="Administrators"
          value={admins.length}
          description="System administrators"
          icon={<ShieldCheck className="h-4 w-4" />}
        />

        <OverviewCard
          title="Staff Members"
          value={staff.length}
          description="Operational personnel"
          icon={<UserCog className="h-4 w-4" />}
        />

      </div>

      {/* Directory */}

      <section className="space-y-5">

        {/* Search Toolbar */}

        <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">
              Personnel Directory
            </h2>

            <p className="text-xs text-muted-foreground">
              {filteredAdmins.length + filteredStaff.length} members displayed
            </p>
          </div>

          <div className="relative w-full sm:max-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search name, email or role..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 pl-9"
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
                onClick={fetchDirectory}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading */}

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-lg border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading personnel...
            </div>
          </div>
        ) : (
          <div className="space-y-7">

            {/* Administrators */}

            <PersonnelSection
              title="Administrators"
              description="People with administrative access to the platform."
              count={filteredAdmins.length}
              icon={<ShieldCheck className="h-4 w-4" />}
              emptyMessage="No administrators found."
            >
              {filteredAdmins.map((admin) => (
                <PersonnelCard
                  key={`admin-${admin.id}`}
                  member={admin}
                  type="admin"
                />
              ))}
            </PersonnelSection>

            {/* Staff */}

            <PersonnelSection
              title="Staff Members"
              description="Personnel available for campus complaint operations."
              count={filteredStaff.length}
              icon={<Users className="h-4 w-4" />}
              emptyMessage="No staff members found."
            >
              {filteredStaff.map((member) => (
                <PersonnelCard
                  key={`staff-${member.id}`}
                  member={member}
                  type="staff"
                />
              ))}
            </PersonnelSection>

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
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="gap-2 py-4">
      <CardContent className="flex items-center justify-between px-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <p className="text-2xl font-semibold tracking-tight">
            {value}
          </p>

          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="rounded-md border p-2 text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------
// Personnel Section
// --------------------------------------------------

function PersonnelSection({
  title,
  description,
  count,
  icon,
  emptyMessage,
  children,
}: {
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">

      {/* Section Header */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-md border p-2 text-muted-foreground">
            {icon}
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              {title}
            </h3>

            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <Badge variant="secondary">
          {count}
        </Badge>
      </div>

      {/* Members */}

      {count === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {children}
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// Personnel Card
// --------------------------------------------------

function PersonnelCard({
  member,
  type,
}: {
  member: StaffMember | Admin;
  type: "admin" | "staff";
}) {
  const isAdmin = type === "admin";

  return (
    <Card className="gap-0 py-0 transition-colors hover:border-primary/30">
      <CardContent className="p-4">

        <div className="flex items-center gap-3">

          {/* Avatar */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-semibold">
            {getInitials(member.name)}
          </div>

          {/* Name and Role */}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {member.name}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {getRoleLabel(member.role)}
            </p>
          </div>

          {/* Role Badge */}

          <Badge variant="outline" className="shrink-0">
            {isAdmin ? "Admin" : "Staff"}
          </Badge>
        </div>

        {/* Divider */}

        <div className="my-3 border-t" />

        {/* Email */}

        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />

          <span className="truncate text-muted-foreground">
            {member.email}
          </span>
        </div>

        {/* Account Type */}

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {isAdmin ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <Building2 className="h-3.5 w-3.5" />
          )}

          {isAdmin
            ? "Administrative account"
            : "Staff account"}
        </div>

      </CardContent>
    </Card>
  );
}

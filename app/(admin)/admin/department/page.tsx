
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDepartmentsApi,
  createDepartmentApi,
} from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import {
  Plus,
  Mail,
  Phone,
  Building2,
  RefreshCw,
  Search,
  AlertCircle,
  ArrowUpRight,
  X,
} from "lucide-react";

import { useMemo } from "react";

type Department = {
  id: number;
  name: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setIsFetching(true);
    setPageError(null);

    try {
      const data = await getDepartmentsApi();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Departments fetch error:", err);
      setPageError(
        err instanceof Error
          ? err.message
          : "Unable to load departments."
      );
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return departments;

    return departments.filter((dept) =>
      [
        dept.name,
        dept.description,
        dept.email,
        dept.phone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [departments, search]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEmail("");
    setPhone("");
    setError(null);
  };

  const handleCreate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    try {
      await createDepartmentApi({
        name: name.trim(),
        description: description.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      resetForm();
      setIsModalOpen(false);
      await fetchDepartments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create department."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="size-4" />
            Organization
            <span>/</span>
            Departments
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Departments
          </h1>

          <p className="text-sm text-muted-foreground">
            Organize the teams responsible for handling campus complaints.
          </p>
        </div>

        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger >
            <Button className="gap-2">
              <Plus className="size-4" />
              New Department
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Create department</DialogTitle>
              <DialogDescription>
                Add a department and its contact information to your campus
                directory.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-5 pt-2">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="department-name">
                  Department name <span className="text-destructive">*</span>
                </Label>

                <Input
                  id="department-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electrical Maintenance"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department-description">
                  Description
                </Label>

                <Input
                  id="department-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this department handle?"
                />
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm font-medium">Contact information</p>
                <p className="text-xs text-muted-foreground">
                  These details are optional.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department-email">Email address</Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="department-email"
                    type="email"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dept@campus.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department-phone">Phone number</Label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="department-phone"
                    className="pl-9"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ext. 1001"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isLoading || !name.trim()}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 size-4" />
                      Create department
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Total departments
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {departments.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Registered in your campus
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg border">
              <Building2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Contact information
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {
                  departments.filter((dept) => dept.email || dept.phone)
                    .length
                }
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Departments with contact details
              </p>
            </div>

            <div className="flex size-11 items-center justify-center rounded-lg border">
              <Mail className="size-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Department directory */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Department directory
            </h2>
            <p className="text-sm text-muted-foreground">
              Browse and manage your campus departments.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search departments..."
                className="pl-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={fetchDepartments}
              disabled={isFetching}
              aria-label="Refresh departments"
            >
              <RefreshCw
                className={`size-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {pageError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription className="flex items-center justify-between gap-3">
              {pageError}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDepartments}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isFetching ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="size-4 animate-spin" />
            Loading departments...
          </div>
        ) : filteredDepartments.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full border">
                <Building2 className="size-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                {search ? "No matching departments" : "No departments yet"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {search
                  ? "Try a different search term."
                  : "Create your first department to start organizing campus complaint management."}
              </p>

              {!search && (
                <Button
                  className="mt-4 gap-2"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="size-4" />
                  Create department
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDepartments.map((dept) => (
              <Card
                key={dept.id}
                className="group flex flex-col transition-colors hover:border-foreground/20"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border">
                      <Building2 className="size-5 text-muted-foreground" />
                    </div>

                    <span className="text-xs text-muted-foreground">
                      ID #{dept.id}
                    </span>
                  </div>

                  <CardTitle className="pt-3 text-base">
                    {dept.name}
                  </CardTitle>

                  <CardDescription className="min-h-10 line-clamp-2">
                    {dept.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="mt-auto">
                  <Separator className="mb-4" />

                  <div className="space-y-3">
                    {dept.email ? (
                      <div className="flex min-w-0 items-center gap-3 text-sm">
                        <Mail className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{dept.email}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Mail className="size-4 shrink-0" />
                        <span>No email provided</span>
                      </div>
                    )}

                    {dept.phone ? (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="size-4 shrink-0 text-muted-foreground" />
                        <span>{dept.phone}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Phone className="size-4 shrink-0" />
                        <span>No phone provided</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-muted-foreground">
                      Campus department
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isFetching && filteredDepartments.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Showing {filteredDepartments.length} of {departments.length} departments
          </p>
        )}
      </section>
    </div>
  );
}

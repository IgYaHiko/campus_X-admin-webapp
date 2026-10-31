
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCategoriesApi,
  createCategoryApi,
  getDepartmentsApi,
} from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Plus,
  X,
  FolderOpen,
  Building2,
  Loader2,
  AlertCircle,
  Tags,
  RefreshCw,
} from "lucide-react";

// --------------------------------------------------
// Types
// --------------------------------------------------

type Department = {
  id: number;
  name: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  defaultDepartmentId?: number | null;
};

// --------------------------------------------------
// Page
// --------------------------------------------------

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [defaultDepartmentId, setDefaultDepartmentId] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --------------------------------------------------
  // Fetch categories and departments
  // --------------------------------------------------

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true);
      setFetchError(null);

      const [cats, depts] = await Promise.all([
        getCategoriesApi(),
        getDepartmentsApi(),
      ]);

      setCategories(cats ?? []);
      setDepartments(depts ?? []);
    } catch (err) {
      console.error("Failed to fetch category data:", err);
      setFetchError("Unable to load categories. Please try again.");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --------------------------------------------------
  // Form helpers
  // --------------------------------------------------

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setDefaultDepartmentId("");
    setError(null);
  };

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newName = event.target.value;

    setName(newName);

    const generatedSlug = newName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setSlug(generatedSlug);
  };

  const handleDialogChange = (open: boolean) => {
    if (isLoading) return;

    setIsModalOpen(open);

    if (!open) {
      resetForm();
    }
  };

  // --------------------------------------------------
  // Create category
  // --------------------------------------------------

  const handleCreate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim() || !slug.trim()) {
      setError("Category name and slug are required.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await createCategoryApi({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        defaultDepartmentId: defaultDepartmentId
          ? Number(defaultDepartmentId)
          : undefined,
      });

      resetForm();
      setIsModalOpen(false);

      await fetchData();
    } catch (err) {
      console.error("Failed to create category:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the category."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-7">
      {/* Page header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Categories
            </h1>

            <span className="rounded-md border px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {categories.length}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            Manage complaint categories and their default departments.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Overview */}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="gap-3 py-5">
          <CardContent className="flex items-center justify-between px-5">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Total Categories
              </p>
              <p className="text-2xl font-semibold tracking-tight">
                {categories.length}
              </p>
            </div>

            <div className="rounded-md border p-2 text-muted-foreground">
              <Tags className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="gap-3 py-5">
          <CardContent className="flex items-center justify-between px-5">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Available Departments
              </p>
              <p className="text-2xl font-semibold tracking-tight">
                {departments.length}
              </p>
            </div>

            <div className="rounded-md border p-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories section */}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold tracking-tight">
              All Categories
            </h2>
            <p className="text-sm text-muted-foreground">
              Categories available to students when reporting complaints.
            </p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={isFetching}
            aria-label="Refresh categories"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Fetch error */}

        {fetchError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-3">
              {fetchError}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading */}

        {isFetching ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-lg border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading categories...
            </div>
          </div>
        ) : categories.length === 0 ? (
          /* Empty state */

          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center">
            <div className="mb-4 rounded-full border p-4 text-muted-foreground">
              <FolderOpen className="h-6 w-6" />
            </div>

            <h3 className="font-semibold">
              No categories yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first complaint category to help students
              report campus issues.
            </p>

            <Button
              className="mt-5 gap-2"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Category
            </Button>
          </div>
        ) : (
          /* Category cards */

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
              const department = departments.find(
                (dept) =>
                  dept.id === category.defaultDepartmentId
              );

              return (
                <Card
                  key={category.id}
                  className="gap-4 py-5 transition-colors hover:border-primary/30"
                >
                  <CardHeader className="space-y-2 px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-muted-foreground">
                          <FolderOpen className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <CardTitle className="truncate text-base">
                            {category.name}
                          </CardTitle>
                          <CardDescription className="mt-1 truncate">
                            /{category.slug}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 px-5">
                    <p className="min-h-10 text-sm leading-relaxed text-muted-foreground">
                      {category.description ||
                        "No description provided."}
                    </p>

                    <div className="flex items-center gap-2 border-t pt-4">
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />

                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Default department
                        </p>
                        <p className="truncate text-sm font-medium">
                          {department?.name || "Unassigned"}
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

      {/* Create category dialog */}

      <Dialog
        open={isModalOpen}
        onOpenChange={handleDialogChange}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>
              Add a new category for students to use when
              submitting campus complaints.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Name */}

            <div className="space-y-2">
              <Label htmlFor="category-name">
                Category Name
              </Label>

              <Input
                id="category-name"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Broken Window"
                required
              />
            </div>

            {/* Slug */}

            <div className="space-y-2">
              <Label htmlFor="category-slug">
                Slug
              </Label>

              <Input
                id="category-slug"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="e.g. broken-window"
                required
              />

              <p className="text-xs text-muted-foreground">
                URL-friendly identifier for this category.
              </p>
            </div>

            {/* Description */}

            <div className="space-y-2">
              <Label htmlFor="category-description">
                Description
                <span className="ml-1 font-normal text-muted-foreground">
                  (Optional)
                </span>
              </Label>

              <Input
                id="category-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Briefly describe this category..."
              />
            </div>

            {/* Department */}

            <div className="space-y-2">
              <Label>Default Department</Label>

              <Select
                value={defaultDepartmentId || "none"}
                onValueChange={(value) =>
                  setDefaultDepartmentId(
                    //@ts-ignore
                    value === "none" ? "" : value
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="none">
                    No department
                  </SelectItem>

                  {departments.map((department) => (
                    <SelectItem
                      key={department.id}
                      value={String(department.id)}
                    >
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isLoading || !name.trim() || !slug.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

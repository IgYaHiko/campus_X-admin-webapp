"use client";

import { useEffect, useState } from "react";
import { getCategoriesApi, createCategoryApi, getDepartmentsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [defaultDepartmentId, setDefaultDepartmentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [cats, depts] = await Promise.all([
        getCategoriesApi(),
        getDepartmentsApi()
      ]);
      setCategories(cats);
      setDepartments(depts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-generate slug when typing name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Auto-slugify: "Wi-Fi Issue" -> "wi-fi-issue"
    const generatedSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createCategoryApi({
        name,
        slug,
        description: description || undefined,
        defaultDepartmentId: defaultDepartmentId ? parseInt(defaultDepartmentId) : undefined,
      });
      setName("");
      setSlug("");
      setDescription("");
      setDefaultDepartmentId("");
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-slate-500">Manage the types of complaints students can file.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="size-4" /> New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const dept = departments.find(d => d.id === cat.defaultDepartmentId);
          return (
            <Card key={cat.id}>
              <CardHeader>
                <CardTitle className="text-lg">{cat.name}</CardTitle>
                <CardDescription>slug: {cat.slug}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-slate-600">{cat.description || "No description"}</p>
                <p className="text-xs font-medium text-slate-500 mt-4">
                  Auto-routes to: <span className="text-slate-900">{dept ? dept.name : "Unassigned"}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Create Category</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                {error && (
                  <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
                )}
                
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input value={name} onChange={handleNameChange} placeholder="e.g., Broken Window" required />
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g., broken-window" required />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." />
                </div>

                <div className="space-y-2">
                  <Label>Default Department</Label>
                  <select 
                    value={defaultDepartmentId} 
                    onChange={(e) => setDefaultDepartmentId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Category"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
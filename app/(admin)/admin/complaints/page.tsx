
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  MoreHorizontal,
  Search,
  Ticket,
} from "lucide-react";

import {
  getAllComplaintsApi,
  getStaffApi,
  assignComplaintApi,
} from "@/lib/api-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Badge,
} from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --------------------------------------------------
// Types
// --------------------------------------------------

type ComplaintStatus = "open" | "in_progress" | "resolved" | string;

type Complaint = {
  id: number;
  title: string;
  location?: string;
  status: ComplaintStatus;
  student?: {
    name?: string;
    email?: string;
  };
  category?: {
    name?: string;
  };
  assignedStaff?: {
    name?: string;
    email?: string;
  };
  createdAt?: string;
};

type Staff = {
  id: number;
  name: string;
  email: string;
};

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getStatusLabel(status: string) {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    default:
      return status;
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "border-blue-500/30 text-blue-600 dark:text-blue-400",
    in_progress:
      "border-amber-500/30 text-amber-600 dark:text-amber-400",
    resolved:
      "border-green-500/30 text-green-600 dark:text-green-400",
  };

  return (
    <Badge
      variant="outline"
      className={styles[status] ?? ""}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}

function formatDate(date?: string) {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "N/A";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SortableHeader({
  column,
  children,
}: {
  column: any;
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

// --------------------------------------------------
// Page
// --------------------------------------------------

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);

  const [selectedStaffEmail, setSelectedStaffEmail] = useState("");

  const [sorting, setSorting] = useState<SortingState>([]);

  // --------------------------------------------------
  // Fetch data
  // --------------------------------------------------

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [complaintsRes, staffRes] = await Promise.all([
        getAllComplaintsApi("?limit=50"),
        getStaffApi(),
      ]);

      setComplaints(complaintsRes?.data ?? []);
      setStaff(staffRes?.data ?? []);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --------------------------------------------------
  // Summary counts
  // --------------------------------------------------

  const totalComplaints = complaints.length;

  const openComplaints = complaints.filter(
    (complaint) => complaint.status === "open"
  ).length;

  const inProgressComplaints = complaints.filter(
    (complaint) => complaint.status === "in_progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "resolved"
  ).length;

  // --------------------------------------------------
  // Filtering
  // --------------------------------------------------

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        complaint.title?.toLowerCase().includes(query) ||
        complaint.student?.name?.toLowerCase().includes(query) ||
        complaint.student?.email?.toLowerCase().includes(query) ||
        complaint.category?.name?.toLowerCase().includes(query) ||
        String(complaint.id).includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, search, statusFilter]);

  // --------------------------------------------------
  // Assignment
  // --------------------------------------------------

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedStaffEmail) return;

    try {
      setAssigning(true);

      await assignComplaintApi(
        selectedComplaint.id,
        selectedStaffEmail
      );

      setSelectedComplaint(null);
      setSelectedStaffEmail("");

      await fetchData();
    } catch (error) {
      console.error("Failed to assign complaint:", error);
    } finally {
      setAssigning(false);
    }
  };

  // --------------------------------------------------
  // Table columns
  // --------------------------------------------------

  const columns: ColumnDef<Complaint>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader column={column}>ID</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          #{row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <SortableHeader column={column}>Complaint</SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="max-w-[260px]">
          <p className="truncate font-medium">
            {row.original.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.location || "No location"}
          </p>
        </div>
      ),
    },
    {
      id: "student",
      accessorFn: (row) => row.student?.name ?? "",
      header: "Student",
      cell: ({ row }) => (
        <div className="min-w-[140px]">
          <p className="font-medium">
            {row.original.student?.name || "Unknown"}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.student?.email || "N/A"}
          </p>
        </div>
      ),
    },
    {
      id: "category",
      accessorFn: (row) => row.category?.name ?? "",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.category?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} />
      ),
    },
    {
      id: "assignedStaff",
      accessorFn: (row) => row.assignedStaff?.name ?? "",
      header: "Assigned To",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.assignedStaff?.name || "Unassigned"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader column={column}>Created</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => (
        <div className="text-right">Actions</div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedComplaint(row.original);
                  setSelectedStaffEmail(
                    row.original.assignedStaff?.email || ""
                  );
                }}
              >
                Assign staff
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // --------------------------------------------------
  // TanStack table
  // --------------------------------------------------

  const table = useReactTable({
    data: filteredComplaints,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-7 ">
      {/* Page heading */}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Complaints
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage, review, and assign campus complaints.
        </p>
      </div>

      {/* Summary cards */}

    {/*   <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Complaints"
          value={totalComplaints}
          icon={<Ticket className="h-4 w-4" />}
        />

        <SummaryCard
          title="Open"
          value={openComplaints}
          icon={<Clock3 className="h-4 w-4" />}
        />

        <SummaryCard
          title="In Progress"
          value={inProgressComplaints}
          icon={<Loader2 className="h-4 w-4" />}
        />

        <SummaryCard
          title="Resolved"
          value={resolvedComplaints}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div> */}

      {/* Table section */}

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          {/* Table toolbar */}

          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                All Complaints
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredComplaints.length} complaints found
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={statusFilter}
                //@ts-ignore
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">
                    In Progress
                  </SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Shadcn data table */}

          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow className="h-16">
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading complaints...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No complaints found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}

          <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(table.getPageCount(), 1)}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment dialog */}

      <Dialog
        open={!!selectedComplaint}
        onOpenChange={(open) => {
          if (!open && !assigning) {
            setSelectedComplaint(null);
            setSelectedStaffEmail("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Complaint</DialogTitle>
            <DialogDescription>
              Select a staff member to handle this complaint.
              {selectedComplaint && (
                <span className="mt-2 block font-medium text-foreground">
                  #{selectedComplaint.id} · {selectedComplaint.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">
              Select staff member
            </label>

            <Select
              value={selectedStaffEmail}
              //@ts-ignore
              onValueChange={setSelectedStaffEmail}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose staff member" />
              </SelectTrigger>

              <SelectContent>
                {staff.map((member) => (
                  <SelectItem
                    key={member.id}
                    value={member.email}
                  >
                    {member.name} ({member.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedComplaint(null);
                setSelectedStaffEmail("");
              }}
              disabled={assigning}
            >
              Cancel
            </Button>

            <Button
              onClick={handleAssign}
              disabled={!selectedStaffEmail || assigning}
            >
              {assigning && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Assign Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --------------------------------------------------
// Summary card
// --------------------------------------------------

function SummaryCard({
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

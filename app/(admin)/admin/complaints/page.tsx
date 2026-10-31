"use client";

import { useEffect, useState } from "react";
import { getAllComplaintsApi, getStaffApi, assignComplaintApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Assignment Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [selectedStaffEmail, setSelectedStaffEmail] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch complaints and staff in parallel
      const [complaintsRes, staffRes] = await Promise.all([
        getAllComplaintsApi("?limit=50"), // Get first 50 for now
        getStaffApi()
      ]);
      setComplaints(complaintsRes.data);
      setStaff(staffRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedStaffEmail) return;
    setIsAssigning(true);
    setError(null);

    try {
      await assignComplaintApi(selectedComplaint.id, selectedStaffEmail);
      setSelectedComplaint(null); // Close modal
      setSelectedStaffEmail("");
      fetchData(); // Refresh list to show new status
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) return <div>Loading complaints...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Complaints Master List</h1>
        <p className="text-slate-500">Review and assign complaints to maintenance staff.</p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-900">Title</th>
                <th className="px-6 py-4 font-medium text-slate-900">Student</th>
                <th className="px-6 py-4 font-medium text-slate-900">Category</th>
                <th className="px-6 py-4 font-medium text-slate-900">Status</th>
                <th className="px-6 py-4 font-medium text-slate-900">Assigned To</th>
                <th className="px-6 py-4 font-medium text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.location}</p>
                  </td>
                  <td className="px-6 py-4">{c.student.name}</td>
                  <td className="px-6 py-4">{c.category.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                      c.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                      c.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.assignedStaff ? c.assignedStaff.name : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {c.status === "open" ? (
                      <Button size="sm" onClick={() => setSelectedComplaint(c)}>
                        Assign Staff
                      </Button>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Assign Complaint</h3>
                  <p className="text-sm text-slate-500">{selectedComplaint.title}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedComplaint(null)}>
                  <X className="size-4" />
                </Button>
              </div>

              {error && (
                <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Staff Member</label>
                <Select value={selectedStaffEmail} 
                //@ts-ignore
                onValueChange={setSelectedStaffEmail}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a staff member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.email}>
                        {s.name} ({s.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={handleAssign} 
                disabled={!selectedStaffEmail || isAssigning}
              >
                {isAssigning ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { getStaffApi } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, ShieldAlert } from "lucide-react";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await getStaffApi();
        setStaff(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  if (loading) return <div>Loading staff directory...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Directory</h1>
        <p className="text-slate-500">Maintenance personnel available for assignment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <Card key={member.id}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="size-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <p className="text-sm text-slate-500 capitalize">{member.role}</p>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="size-4" />
                {member.email}
              </div>
            </CardContent>
          </Card>
        ))}
        {staff.length === 0 && (
          <p className="text-slate-500 col-span-3">No active staff found.</p>
        )}
      </div>
    </div>
  );
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token"); // Use a distinct key so student/admin tokens don't clash
}

export function setToken(token: string) {
  localStorage.setItem("admin_token", token);
}

export function removeToken() {
  localStorage.removeItem("admin_token");
}

export async function loginApi(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");

  // 🔒 CRITICAL: Ensure only admins can log in here
  if (json.user.role !== "admin") {
    throw new Error("Access denied. Admin credentials required.");
  }

  return json; 
}

export async function registerAdminApi(data: any) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, role: "admin" }), // <-- Hardcode role as admin
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Admin registration failed");

  return json;
}
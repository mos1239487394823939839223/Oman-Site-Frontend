import { adminCredentials } from "@/data/adminCredentials";

export interface LocalUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  addresses: any[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Check if credentials match local admin credentials
 */
export function checkLocalAdminCredentials(
  email: string,
  password: string
): boolean {
  return (
    email.toLowerCase() === adminCredentials.admin.email.toLowerCase() &&
    password === adminCredentials.admin.password
  );
}

/**
 * Get local admin user object
 */
export function getLocalAdminUser(): LocalUser {
  const admin = adminCredentials.admin;
  const now = new Date().toISOString();
  
  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
    active: true,
    addresses: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Generate a mock token for local admin
 */
export function generateLocalAdminToken(): string {
  // Generate a simple token (in production, use proper JWT)
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `local_admin_token_${timestamp}_${random}`;
}


export interface AdminCredentials {
  email: string;
  password: string;
  name: string;
  role: string;
  phone: string;
  _id: string;
}

export const adminCredentials = {
  admin: {
    email: "admin@admin.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    phone: "+1234567890",
    _id: "admin_local_user"
  } as AdminCredentials
};


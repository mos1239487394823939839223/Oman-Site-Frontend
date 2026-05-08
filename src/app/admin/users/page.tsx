"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRouteGuard from "@/components/admin/AdminRouteGuard";
import UsersTable from "@/components/admin/UsersTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import UserForm from "@/components/admin/UserForm";
import { adminApi } from "@/services/adminApi";
import { User } from "@/services/clientApi";
import { FaPlus, FaTimes } from "react-icons/fa";

function UsersManagementContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      setUsers(response?.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    role: string;
  }) => {
    try {
      setFormLoading(true);
      
      if (editingUser) {
        // Update existing user
        await adminApi.updateUser(editingUser._id, data);
      } else {
        // Create new user
        if (!data.password) {
          throw new Error("Password is required for new users");
        }
        await adminApi.createUser(data);
      }
      
      setShowForm(false);
      setEditingUser(null);
      fetchData(); // Refresh list
    } catch (error: any) {
      console.error("Error saving user:", error);
      alert(error.message || "Failed to save user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleDelete = (user: User) => {
    setDeleteUser(user);
  };

  const handleToggleActive = async (user: User) => {
    try {
      await adminApi.toggleUserActive(user._id);
      fetchData(); // Refresh list
    } catch (error: any) {
      console.error("Error toggling user active status:", error);
      alert(error.message || "Failed to update user status");
    }
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;

    try {
      await adminApi.deleteUser(deleteUser._id);
      setUsers(users.filter((u) => u._id !== deleteUser._id));
      setDeleteUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-full">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                <p className="text-gray-600 mt-1">Manage your platform users and admins</p>
              </div>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Create User
              </button>
            </div>

            {/* Users Table */}
            <UsersTable
              users={users}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />

            {/* User Form Modal */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingUser ? "Edit User" : "Create New User"}
                    </h2>
                    <button
                      onClick={handleFormCancel}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={formLoading}
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6">
                    <UserForm
                      user={editingUser}
                      onSubmit={handleFormSubmit}
                      onCancel={handleFormCancel}
                      loading={formLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
              isOpen={!!deleteUser}
              title="Delete User"
              message={`Are you sure you want to delete "${deleteUser?.name}"? This action cannot be undone.`}
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={confirmDelete}
              onCancel={() => setDeleteUser(null)}
              isDanger={true}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function UsersManagementPage() {
  return (
    <AdminRouteGuard>
      <UsersManagementContent />
    </AdminRouteGuard>
  );
}


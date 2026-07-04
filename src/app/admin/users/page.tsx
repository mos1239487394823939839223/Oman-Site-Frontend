"use client";

import { useState, useEffect } from "react";
import UsersTable from "@/components/admin/UsersTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import UserForm from "@/components/admin/UserForm";
import { adminApi } from "@/services/adminApi";
import { User } from "@/services/clientApi";
import { FaPlus, FaTimes } from "react-icons/fa";

export default function UsersManagementPage() {
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
        const { password, ...userData } = data;
        await adminApi.updateUser(editingUser._id, userData);
        if (password) {
          await adminApi.changeUserPassword(editingUser._id, {
            password,
            rePassword: password,
          });
        }
      } else {
        if (!data.password) {
          throw new Error("Password is required for new users");
        }
        await adminApi.createUser(data);
      }

      setShowForm(false);
      setEditingUser(null);
      fetchData();
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
      fetchData();
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
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Users Management</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your platform users and admins</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2.5 bg-[#5C2E3A] text-white rounded-xl hover:bg-[#4A2330] transition-colors flex items-center gap-2 font-bold text-sm shadow-sm"
        >
          <FaPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      <UsersTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingUser ? "Edit User" : "Create New User"}
              </h2>
              <button
                onClick={handleFormCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
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
    </>
  );
}

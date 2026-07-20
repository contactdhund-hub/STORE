"use client";

import { useState } from "react";
import { KeyRound, Trash2 } from "lucide-react";
import { updateUserRole, updateUserPassword, deleteUser } from "@/actions/user";

type User = {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
};

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean; userId: string; email: string }>({
    isOpen: false,
    userId: "",
    email: ""
  });
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setIsLoading(userId);
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error(error);
      alert("Failed to update user role");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      setIsLoading(userId);
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    } finally {
      setIsLoading(null);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await updateUserPassword(passwordModal.userId, newPassword);
      setPasswordModal({ isOpen: false, userId: "", email: "" });
      setNewPassword("");
      alert("Password updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{user.email}</div>
                    <div className="text-xs text-slate-500 mt-1">{user.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isLoading === user.id}
                      className="bg-slate-100 border-none text-slate-700 text-xs rounded-lg focus:ring-blue-500 py-1.5 px-3 cursor-pointer"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPasswordModal({ isOpen: true, userId: user.id, email: user.email })}
                        disabled={isLoading === user.id}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Change Password"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isLoading === user.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Password Modal */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Change Password</h3>
              <p className="text-sm text-slate-500 mb-6">
                Enter a new password for <span className="font-semibold">{passwordModal.email}</span>.
              </p>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter at least 6 characters"
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordModal({ isOpen: false, userId: "", email: "" });
                      setNewPassword("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

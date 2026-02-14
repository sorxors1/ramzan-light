import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminApi } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Copy, Pencil, Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  father_name: string | null;
  cnic: string | null;
  address: string | null;
  email: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null);

  // Form state
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");
  const [formFatherName, setFormFatherName] = useState("");
  const [formCnic, setFormCnic] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await adminApi("list_users");
      setUsers(data.users || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => {
    setFormUsername("");
    setFormEmail("");
    setFormPassword("");
    setFormDisplayName("");
    setFormFatherName("");
    setFormCnic("");
    setFormAddress("");
  };

  const handleCreate = async () => {
    if (!formUsername || !formPassword || !formDisplayName || !formFatherName) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      await adminApi("create_user", {
        username: formUsername,
        email: formEmail || undefined,
        password: formPassword,
        display_name: formDisplayName,
        father_name: formFatherName,
        cnic: formCnic,
        address: formAddress,
      });
      toast.success("User created successfully!");
      setCreatedCredentials({ username: formUsername, password: formPassword });
      setShowAddForm(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await adminApi("update_user", {
        user_id: editUser.user_id,
        display_name: formDisplayName,
        father_name: formFatherName,
        cnic: formCnic,
        address: formAddress,
      });
      toast.success("User updated!");
      setEditUser(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      await adminApi("delete_user", { user_id: deleteUserId });
      toast.success("User deleted");
      setDeleteUserId(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const copyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Username: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard!");
  };

  const startEdit = (user: UserProfile) => {
    setEditUser(user);
    setFormDisplayName(user.display_name || "");
    setFormFatherName(user.father_name || "");
    setFormCnic(user.cnic || "");
    setFormAddress(user.address || "");
  };

  return (
    <AdminLayout title="Users">
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Users</h1>
            <p className="text-xs text-muted-foreground">{users.length} students</p>
          </div>
          <Button
            onClick={() => { setShowAddForm(true); resetForm(); }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Add User
          </Button>
        </div>

        {/* Created Credentials Banner */}
        {createdCredentials && (
          <div className="rounded-xl p-4 mb-4 bg-green-50 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-green-800">User Created!</h3>
              <button onClick={() => setCreatedCredentials(null)}>
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
            <p className="text-xs text-green-700 mb-1">Username: {createdCredentials.username}</p>
            <p className="text-xs text-green-700 mb-2">Password: {createdCredentials.password}</p>
            <Button size="sm" variant="outline" onClick={copyCredentials} className="border-green-300 text-green-700">
              <Copy className="w-3 h-3 mr-1" /> Copy Credentials
            </Button>
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editUser) && (
          <div className="rounded-xl p-4 mb-4 bg-card shadow-lg border border-border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-foreground">
                {editUser ? "Edit User" : "Add New User"}
              </h3>
              <button onClick={() => { setShowAddForm(false); setEditUser(null); resetForm(); }}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              {!editUser && (
                <>
                  <div>
                    <label className="text-xs font-medium text-foreground">Username *</label>
                    <Input
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="Enter username"
                      className="h-10 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Email (Optional)</label>
                    <Input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="h-10 rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Password *</label>
                    <Input
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Strong password"
                      className="h-10 rounded-lg mt-1"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs font-medium text-foreground">Display Name *</label>
                <Input
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  placeholder="Student name"
                  className="h-10 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Father's Name *</label>
                <Input
                  value={formFatherName}
                  onChange={(e) => setFormFatherName(e.target.value)}
                  placeholder="Father's name"
                  className="h-10 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">CNIC (Optional)</label>
                <Input
                  value={formCnic}
                  onChange={(e) => setFormCnic(e.target.value)}
                  placeholder="XXXXX-XXXXXXX-X"
                  className="h-10 rounded-lg mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Address (Optional)</label>
                <Input
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Address"
                  className="h-10 rounded-lg mt-1"
                />
              </div>
              <Button
                onClick={editUser ? handleUpdate : handleCreate}
                disabled={saving}
                className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90"
              >
                {saving ? "Saving..." : editUser ? "Update User" : "Create User"}
              </Button>
            </div>
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No users yet. Add your first user!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="rounded-xl p-3 bg-card shadow border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{user.display_name || "No name"}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username || "no-username"}</p>
                    {user.father_name && (
                      <p className="text-xs text-muted-foreground">S/O: {user.father_name}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => startEdit(user)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => setDeleteUserId(user.user_id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this user and all their data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;

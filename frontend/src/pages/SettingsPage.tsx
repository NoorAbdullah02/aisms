import { useState } from "react";
import toast from "react-hot-toast";
import { User, Lock, Save, Key, UploadCloud, Mail, Image as ImageIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!user) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        toast.loading("Uploading photo to Cloudinary...", { id: "upload" });
        const res = await api.post("/upload/image", { image: base64 });
        const { url, provider } = res.data as { url: string; provider: string };
        setAvatarUrl(url);
        toast.success(`Photo uploaded successfully via ${provider === "cloudinary" ? "Cloudinary CDN" : "Storage"}!`, { id: "upload" });
      } catch {
        toast.error("Upload failed.", { id: "upload" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.patch("/auth/profile", { fullName, avatarUrl });
      const updatedUser = res.data;
      updateUser(updatedUser);
      toast.success("Profile and photo updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Account & System Settings"
        subtitle="Manage your personal profile photo, Cloudinary storage, security credentials, Brevo email, and AI status."
      />

      <div className="space-y-6">
        {/* Profile & Photo Section */}
        <div className="card">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Personal Profile & Photo Upload (Cloudinary CDN)</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="mt-6 space-y-6">
            {/* Avatar Preview & Selection */}
            <div>
              <label className="label">Profile Photo</label>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="relative flex h-16 w-16 overflow-hidden items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xl shadow-md border-2 border-white">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    user.fullName.charAt(0)
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label htmlFor="photo-file" className="btn-secondary text-xs cursor-pointer">
                    <UploadCloud className="h-4 w-4 text-blue-600" />
                    Upload Device Photo
                  </label>
                  <input
                    type="file"
                    id="photo-file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="w-full sm:w-auto">
                    <input
                      type="url"
                      className="input text-xs"
                      placeholder="Or paste photo URL..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Presets */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">Or select preset avatar:</p>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_PRESETS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`relative h-10 w-10 overflow-hidden rounded-full border-2 transition ${
                        avatarUrl === url ? "border-blue-600 scale-110 shadow-sm" : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Reset Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Email Address (Read-only)</label>
                <input type="email" className="input bg-slate-50 text-slate-500 cursor-not-allowed" value={user.email} disabled />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="badge bg-blue-50 text-blue-700 border border-blue-200 capitalize font-bold">
                  {user.role} Account
                </span>
                <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Active Status
                </span>
              </div>

              <button type="submit" className="btn-primary" disabled={profileLoading}>
                <Save className="h-4 w-4" />
                {profileLoading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="card">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Lock className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Security & Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="mt-6 space-y-4 max-w-md">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                className="input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className="input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={passwordLoading}>
              <Key className="h-4 w-4" />
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Regional & Currency Configuration Section */}
        <div className="card">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span className="text-lg font-bold text-blue-600">৳</span>
            <h3 className="text-lg font-bold text-slate-900">Institution Currency & Regional Settings</h3>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label className="label text-slate-700 font-bold">Default Currency</label>
              <div className="mt-1 font-mono text-sm font-semibold text-blue-700">Bangladeshi Taka (BDT / ৳)</div>
              <p className="mt-1 text-xs text-slate-500">All fees, invoices, and accounting totals are calculated and displayed in Taka (৳).</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label className="label text-slate-700 font-bold">Student Email Domain</label>
              <div className="mt-1 font-mono text-sm font-semibold text-blue-700">@student.aisms.edu.bd</div>
              <p className="mt-1 text-xs text-slate-500">Default auto-generated domain for student login and academic notifications.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label className="label text-slate-700 font-bold">Faculty Email Domain</label>
              <div className="mt-1 font-mono text-sm font-semibold text-blue-700">@faculty.aisms.edu.bd</div>
              <p className="mt-1 text-xs text-slate-500">Default auto-generated domain for teachers and department heads.</p>
            </div>
          </div>
        </div>

        {/* Integration Engine Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Mail className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Brevo Transactional Email Engine</h4>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Dispatches password reset instructions and portal notifications via Brevo SMTP API with automatic fallback protection.
            </p>
            <span className="mt-3 inline-block badge bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              Brevo API Ready
            </span>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Cloudinary Photo Storage CDN</h4>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Stores and optimizes user profile photos across devices via Cloudinary high-speed image CDN.
            </p>
            <span className="mt-3 inline-block badge bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              Cloudinary Storage Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

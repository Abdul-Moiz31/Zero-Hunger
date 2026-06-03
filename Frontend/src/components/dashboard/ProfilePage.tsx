import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, MapPin, Phone, Star, Package, Heart, Save, Loader2, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/axios';

interface ProfileData {
  name: string;
  email: string;
  role: string;
  organization_name?: string;
  bio?: string;
  website?: string;
  address?: string;
  contact_number?: string;
  joinedDate: string;
  rating: number;
  completedOrders: number;
}

const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', website: '', address: '', contact_number: '' });

  useEffect(() => {
    if (!user) return;
    // Use the current user data + fetch extended profile
    api.get(`/profiles/${(user as any)._id || (user as any).id}`)
      .then((r) => {
        const u = r.data.user;
        setProfile(u);
        setForm({
          bio: u.bio || '',
          website: u.website || '',
          address: u.address || '',
          contact_number: u.contact_number || '',
        });
      })
      .catch(() => {
        // Fallback from auth context
        setProfile({ ...user, joinedDate: new Date().toISOString(), rating: 0, completedOrders: 0 } as any);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/profiles/me', form);
      setProfile((p) => p ? { ...p, ...data } : null);
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-500" /></div>
  );
  if (!profile) return null;

  const roleColor: Record<string, string> = {
    donor: 'bg-green-100 text-green-700',
    ngo: 'bg-blue-100 text-blue-700',
    volunteer: 'bg-amber-100 text-amber-700',
    admin: 'bg-rose-100 text-rose-700',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Profile hero card */}
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-3xl font-black text-white shadow-lg">
            {profile.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-extrabold text-gray-900">{profile.name}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${roleColor[profile.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {profile.role}
              </span>
            </div>
            {profile.organization_name && (
              <p className="mt-0.5 text-sm text-gray-500">{profile.organization_name}</p>
            )}
            <p className="mt-1 text-sm text-gray-400">
              Member since {new Date(profile.joinedDate).toLocaleDateString('en', { year: 'numeric', month: 'long' })}
            </p>

            {/* Stats row */}
            <div className="mt-4 flex flex-wrap gap-4">
              {profile.role === 'volunteer' && (
                <>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold text-gray-700">{profile.rating.toFixed(1)}</span>
                    <span className="text-gray-400">rating</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Package className="h-4 w-4 text-green-500" />
                    <span className="font-semibold text-gray-700">{profile.completedOrders}</span>
                    <span className="text-gray-400">deliveries</span>
                  </div>
                </>
              )}
              {(profile.role === 'donor' || profile.role === 'ngo') && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span className="font-semibold text-gray-700">{profile.completedOrders}</span>
                  <span className="text-gray-400">{profile.role === 'donor' ? 'donations' : 'received'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setEditing((v) => !v)}
            className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-semibold transition ${editing ? 'border-gray-200 text-gray-500 hover:bg-gray-50' : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'}`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Bio */}
        {!editing && profile.bio && (
          <p className="mt-5 border-t border-gray-100 pt-5 text-sm text-gray-600">{profile.bio}</p>
        )}

        {/* Quick info */}
        {!editing && (
          <div className="mt-5 flex flex-wrap gap-4">
            {profile.contact_number && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Phone className="h-3.5 w-3.5" />{profile.contact_number}
              </span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-sm text-green-600 hover:underline">
                <Globe className="h-3.5 w-3.5" />{profile.website}
              </a>
            )}
            {profile.address && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />{profile.address}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 font-bold text-gray-900">Edit profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                rows={3} placeholder="Tell donors and NGOs about your organisation…"
                className={`${inputCls} resize-none`} maxLength={500} />
              <p className="text-right text-[10px] text-gray-400">{form.bio.length}/500</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Website</label>
              <input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://yourorg.com" className={inputCls} type="url" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Contact number</label>
              <input value={form.contact_number} onChange={(e) => setForm((p) => ({ ...p, contact_number: e.target.value }))}
                placeholder="+92 300 1234567" className={inputCls} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Address</label>
              <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Your full address" className={inputCls} />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfilePage;

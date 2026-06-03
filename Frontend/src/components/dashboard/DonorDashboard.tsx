/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useDonorContext } from '@/contexts/donorContext';
import api from '@/utils/axios';
import {
  Package2, Clock, CheckCircle, Plus, X, Calendar, Clock3,
  Trash2, Bell, CalendarClock, TrendingUp, ArrowRight, Utensils,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { StatCard, NotificationBell, StatusBadge } from '../ui';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { fadeUp, staggerContainer } from '../ui/motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Donation {
  _id: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  expiry_time: string;
  pickup_window_start: string;
  pickup_window_end: string;
  status: 'available' | 'assigned' | 'completed';
  temperature_requirements?: string;
  contact_number: string;
  dietary_info?: string;
  img?: string;
  pickup_location?: string;
  createdAt?: string;
}

interface Notification {
  _id: string; recipientId: string; message: string;
  taskId: { _id: string; title: string }; read: boolean; createdAt: string;
}

interface FormData {
  title: string; description: string; quantity: string; unit: string;
  expiry_time: string; pickup_window_start: string; pickup_window_end: string;
  temperature_requirements: string; contact_number: string; dietary_info: string;
  pickup_location: string; img?: File | null;
}

// ─── Input helper ─────────────────────────────────────────────────────────────
const Field = ({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const inputCls = (err?: string) =>
  `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 ${err ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-white'}`;

// ─── Donation Form (modal) ────────────────────────────────────────────────────
const DonationForm = ({
  onClose, onSubmit, initialFormData,
}: {
  onClose: () => void;
  onSubmit: (e: React.FormEvent, formData: FormData) => Promise<void>;
  initialFormData: FormData;
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Partial<FormData> = {};
    const now = new Date();
    if (!formData.title.trim()) e.title = 'Required';
    if (!formData.description.trim()) e.description = 'Required';
    if (!formData.quantity || Number(formData.quantity) <= 0) e.quantity = 'Must be positive';
    if (!formData.unit) e.unit = 'Required';
    if (!formData.expiry_time) e.expiry_time = 'Required';
    else if (new Date(formData.expiry_time) <= now) e.expiry_time = 'Must be in the future';
    if (!formData.pickup_window_start) e.pickup_window_start = 'Required';
    else if (new Date(formData.pickup_window_start) <= now) e.pickup_window_start = 'Must be in the future';
    if (!formData.pickup_window_end) e.pickup_window_end = 'Required';
    else if (new Date(formData.pickup_window_end) <= new Date(formData.pickup_window_start)) e.pickup_window_end = 'Must be after start';
    if (!formData.pickup_location.trim()) e.pickup_location = 'Required';
    if (!formData.contact_number.trim()) e.contact_number = 'Required';
    else if (!/^\+?\d{10,15}$/.test(formData.contact_number)) e.contact_number = 'Invalid format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try { await onSubmit(e, formData); } finally { setIsSubmitting(false); }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">New donation listing</h3>
              <p className="text-xs text-gray-400">Fill in the details about your surplus food</p>
            </div>
            <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[72vh] px-6 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Title" error={errors.title}>
                  <input name="title" value={formData.title} onChange={change} placeholder="e.g. Leftover biriyani"
                    className={inputCls(errors.title)} disabled={isSubmitting} />
                </Field>
                <Field label="Quantity" error={errors.quantity || errors.unit}>
                  <div className="flex gap-2">
                    <input type="number" name="quantity" value={formData.quantity} onChange={change} min="1"
                      className={inputCls(errors.quantity)} disabled={isSubmitting} placeholder="0" />
                    <select name="unit" value={formData.unit} onChange={change}
                      className={`w-28 rounded-xl border px-3 py-2.5 text-sm ${errors.unit ? 'border-red-300' : 'border-gray-200'} bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20`}
                      disabled={isSubmitting}>
                      <option value="meals">Meals</option>
                      <option value="kg">kg</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>
                </Field>

                <Field label="Description" error={errors.description}>
                  <textarea name="description" value={formData.description} onChange={change} rows={3}
                    className={`${inputCls(errors.description)} sm:col-span-2`} disabled={isSubmitting}
                    placeholder="What food is it, any allergens, condition, etc." />
                </Field>

                <Field label="Expiry time" error={errors.expiry_time}>
                  <input type="datetime-local" name="expiry_time" value={formData.expiry_time} onChange={change}
                    min={new Date().toISOString().slice(0, 16)} className={inputCls(errors.expiry_time)} disabled={isSubmitting} />
                </Field>
                <Field label="Temperature requirements">
                  <input name="temperature_requirements" value={formData.temperature_requirements} onChange={change}
                    className={inputCls()} disabled={isSubmitting} placeholder="e.g. Keep refrigerated" />
                </Field>
                <Field label="Pickup window start" error={errors.pickup_window_start}>
                  <input type="datetime-local" name="pickup_window_start" value={formData.pickup_window_start} onChange={change}
                    min={new Date().toISOString().slice(0, 16)} className={inputCls(errors.pickup_window_start)} disabled={isSubmitting} />
                </Field>
                <Field label="Pickup window end" error={errors.pickup_window_end}>
                  <input type="datetime-local" name="pickup_window_end" value={formData.pickup_window_end} onChange={change}
                    min={formData.pickup_window_start || new Date().toISOString().slice(0, 16)}
                    className={inputCls(errors.pickup_window_end)} disabled={isSubmitting} />
                </Field>

                <Field label="Dietary information">
                  <input name="dietary_info" value={formData.dietary_info} onChange={change}
                    className={inputCls()} disabled={isSubmitting} placeholder="e.g. Vegan, contains nuts" />
                </Field>
                <Field label="Pickup location" error={errors.pickup_location}>
                  <input name="pickup_location" value={formData.pickup_location} onChange={change}
                    className={inputCls(errors.pickup_location)} disabled={isSubmitting} placeholder="Full address" />
                </Field>
                <Field label="Contact number" error={errors.contact_number}>
                  <input name="contact_number" value={formData.contact_number} onChange={change}
                    className={inputCls(errors.contact_number)} disabled={isSubmitting} placeholder="+92 300 1234567" />
                </Field>
                <Field label="Photo (optional)">
                  <input type="file" accept="image/*"
                    onChange={(e) => setFormData((p) => ({ ...p, img: e.target.files?.[0] ?? null }))}
                    className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-green-700 hover:file:bg-green-100"
                    disabled={isSubmitting} />
                </Field>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button type="button" onClick={onClose} disabled={isSubmitting}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-60">
                  {isSubmitting ? (
                    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating…</>
                  ) : (
                    <><Plus className="h-4 w-4" />Create listing</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'donations'>('overview');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    stats, donations, notifications, getDonorStats, setDonations,
    getMyDonations, deleteDonation, updateDonationStatus, getNotifications, markNotificationAsRead,
  } = useDonorContext();

  const initialFormData: FormData = {
    title: '', description: '', quantity: '', unit: 'meals', expiry_time: '',
    pickup_window_start: '', pickup_window_end: '', temperature_requirements: '',
    contact_number: '', dietary_info: '', pickup_location: '', img: null,
  };

  const handleSubmit = useCallback(async (e: React.FormEvent, formData: FormData) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (k === 'img' && v instanceof File) fd.append('img', v);
      else if (k !== 'img' && v !== null && v !== undefined) fd.append(k, String(v));
    });
    const { data } = await api.post('/donor/donate', fd);
    setDonations((prev) => [data.food, ...prev]);
    setShowDonationForm(false);
    toast.success('Donation listed successfully!');
  }, [setDonations]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        await Promise.all([getDonorStats(), getMyDonations(), getNotifications()]);
      } catch (err: any) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [getDonorStats, getMyDonations, getNotifications]);

  const onRealtime = useCallback((n: { message: string }) => {
    getNotifications().catch(() => {});
    toast.success(n.message, { duration: 4000 });
  }, [getNotifications]);
  useRealtimeNotifications(onRealtime);

  if (isLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-green-100 border-t-green-600" />
    </div>
  );
  if (error) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-red-600">{error}</p>
      <button onClick={() => window.location.reload()}
        className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white">Retry</button>
    </div>
  );

  const unread = notifications.filter((n: Notification) => !n.read).length;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Donor Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {donations.length} listing{donations.length !== 1 ? 's' : ''} · {unread} unread notification{unread !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex rounded-xl border border-gray-200 bg-gray-100 p-1 text-sm">
            {(['overview', 'donations'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`rounded-lg px-4 py-1.5 font-semibold capitalize transition
                  ${activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'overview' ? 'Overview' : 'My Donations'}
              </button>
            ))}
          </div>
          <NotificationBell notifications={notifications} onMarkRead={(id) => markNotificationAsRead(id)} />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowDonationForm(true)}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New donation</span>
          </motion.button>
        </div>
      </div>

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total donations" value={stats.totalDonations || 0} icon={Package2} accent="green" index={0} />
            <StatCard label="Pending pickups" value={stats.pendingDonations || 0} icon={Clock} accent="amber" index={1} />
            <StatCard label="Completed" value={stats.completedDonations || 0} icon={CheckCircle} accent="blue" index={2} />
          </div>

          {/* Recent donations */}
          <motion.div variants={fadeUp} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Recent donations</h2>
              <button onClick={() => setActiveTab('donations')}
                className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:underline">
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {donations.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                  <Utensils className="h-7 w-7 text-green-400" />
                </div>
                <p className="font-semibold text-gray-700">No donations yet</p>
                <p className="text-sm text-gray-400">Create your first food listing to get started.</p>
                <button onClick={() => setShowDonationForm(true)}
                  className="mt-1 flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white">
                  <Plus className="h-4 w-4" />New donation
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {donations.slice(0, 6).map((d: Donation) => (
                  <div key={d._id}
                    className="flex items-center justify-between rounded-2xl border border-gray-50 bg-gray-50/50 px-4 py-3 transition hover:bg-gray-100/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100">
                        <Package2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{d.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(d.pickup_window_start).toLocaleDateString()}
                          <Clock3 className="h-3 w-3" />
                          {new Date(d.pickup_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">{d.quantity} {d.unit}</span>
                      <StatusBadge status={d.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick insight */}
          <motion.div variants={fadeUp}
            className="rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <TrendingUp className="mb-2 h-6 w-6 opacity-80" />
                <h3 className="text-lg font-bold">You've made an impact!</h3>
                <p className="mt-1 text-sm text-green-100/80">
                  {stats.completedDonations || 0} completed donations from your account.
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black">{stats.completedDonations || 0}</p>
                <p className="text-xs text-green-200">meals rescued</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── All Donations ── */}
      {activeTab === 'donations' && (
        <DonationsList
          donations={donations}
          onDelete={deleteDonation}
          onStatusChange={updateDonationStatus}
          onNew={() => setShowDonationForm(true)}
        />
      )}

      {/* Donation form modal */}
      {showDonationForm && (
        <DonationForm
          onClose={() => setShowDonationForm(false)}
          onSubmit={handleSubmit}
          initialFormData={initialFormData}
        />
      )}
    </div>
  );
};

// ─── Donations list with sortable table ──────────────────────────────────────
const STATUS_OPTIONS = ['available', 'assigned', 'completed'] as const;

const DonationsList = ({
  donations, onDelete, onStatusChange, onNew,
}: {
  donations: Donation[];
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onNew: () => void;
}) => {
  const [actionId, setActionId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setActionId(id);
    try { await onDelete(id); } catch { toast.error('Failed to delete.'); } finally { setActionId(null); }
  };

  const handleStatus = async (id: string, status: string) => {
    setActionId(id);
    try { await onStatusChange(id, status); } catch { toast.error('Failed to update.'); } finally { setActionId(null); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="font-bold text-gray-900">All donations ({donations.length})</h2>
        <button onClick={onNew}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 transition">
          <Plus className="h-3.5 w-3.5" />New donation
        </button>
      </div>

      {donations.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
            <Package2 className="h-7 w-7 text-green-400" />
          </div>
          <p className="font-semibold text-gray-700">No donations found</p>
          <button onClick={onNew} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white">
            Create one
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Title', 'Qty', 'Pickup window', 'Location', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id} className="border-b border-gray-50 transition hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.title}</td>
                  <td className="px-4 py-3 text-gray-500">{d.quantity} {d.unit}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(d.pickup_window_start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{d.pickup_location}</td>
                  <td className="px-4 py-3">
                    <select
                      value={d.status}
                      onChange={(e) => handleStatus(d._id, e.target.value)}
                      disabled={actionId === d._id}
                      className="rounded-lg border-0 bg-transparent text-xs font-semibold focus:ring-2 focus:ring-green-500 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(d._id)}
                      disabled={actionId === d._id}
                      className="rounded-lg p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default DonorDashboard;

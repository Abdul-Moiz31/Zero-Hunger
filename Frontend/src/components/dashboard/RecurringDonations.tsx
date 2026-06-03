import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarClock, Play, Trash2, Power, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/utils/axios';
import { fadeUp, staggerContainer } from '../ui/motion';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Schedule {
  _id: string;
  label: string;
  daysOfWeek: number[];
  timeHHMM: string;
  active: boolean;
  lastRunAt?: string;
  template: {
    title: string;
    description: string;
    quantity: number;
    unit: string;
    pickup_location: string;
    contact_number: string;
    pickup_duration_hours: number;
  };
}

const emptyTemplate = {
  title: '', description: '', quantity: 1, unit: 'meals', pickup_location: '',
  contact_number: '', pickup_duration_hours: 2,
};

const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20';

const RecurringDonations: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [form, setForm] = useState({
    label: '',
    daysOfWeek: [] as number[],
    timeHHMM: '18:00',
    template: { ...emptyTemplate },
  });

  useEffect(() => {
    api.get('/schedules').then((r) => setSchedules(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleDay = (d: number) =>
    setForm((p) => ({
      ...p,
      daysOfWeek: p.daysOfWeek.includes(d) ? p.daysOfWeek.filter((x) => x !== d) : [...p.daysOfWeek, d],
    }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.daysOfWeek.length || !form.template.title) {
      toast.error('Fill in all required fields'); return;
    }
    try {
      const { data } = await api.post('/schedules', form);
      setSchedules((p) => [data, ...p]);
      setShowForm(false);
      setForm({ label: '', daysOfWeek: [], timeHHMM: '18:00', template: { ...emptyTemplate } });
      toast.success('Schedule created!');
    } catch { toast.error('Failed to create schedule'); }
  };

  const handleToggle = async (s: Schedule) => {
    setActionId(s._id);
    try {
      const { data } = await api.patch(`/schedules/${s._id}`, { active: !s.active });
      setSchedules((p) => p.map((x) => (x._id === s._id ? data : x)));
    } catch { toast.error('Failed to update'); } finally { setActionId(null); }
  };

  const handleDelete = async (id: string) => {
    setActionId(id);
    try {
      await api.delete(`/schedules/${id}`);
      setSchedules((p) => p.filter((x) => x._id !== id));
      toast.success('Schedule deleted');
    } catch { toast.error('Failed to delete'); } finally { setActionId(null); }
  };

  const handleRun = async (id: string) => {
    setActionId(id);
    try {
      await api.post(`/schedules/${id}/run`);
      toast.success('Donation listing created now!');
    } catch { toast.error('Failed to run'); } finally { setActionId(null); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Recurring Donations</h2>
          <p className="mt-0.5 text-sm text-gray-500">Auto-create listings on a weekly schedule</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-green-700">
          <Plus className="h-4 w-4" />New schedule
        </motion.button>
      </div>

      {/* Schedule list */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-green-500" /></div>
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <CalendarClock className="h-10 w-10 text-gray-300" />
          <p className="font-semibold text-gray-500">No recurring schedules yet</p>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />Create one
          </button>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2">
          {schedules.map((s) => (
            <motion.div key={s._id} variants={fadeUp}
              className={`rounded-3xl border bg-white p-5 shadow-sm transition ${s.active ? 'border-green-100' : 'border-gray-100 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <CalendarClock className={`h-4 w-4 shrink-0 ${s.active ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className="font-bold text-gray-900 truncate">{s.label}</p>
                    {!s.active && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">Paused</span>}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 truncate">{s.template.title} — {s.template.quantity} {s.template.unit}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {DAYS.map((d, i) => (
                      <span key={d} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.daysOfWeek.includes(i) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{d}</span>
                    ))}
                    <span className="ml-1 text-[11px] text-gray-400 self-center">@ {s.timeHHMM}</span>
                  </div>
                  {s.lastRunAt && (
                    <p className="mt-1.5 text-[11px] text-gray-400">Last run: {new Date(s.lastRunAt).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button onClick={() => handleRun(s._id)} disabled={actionId === s._id} title="Run now"
                    className="rounded-xl p-2 text-green-600 hover:bg-green-50 disabled:opacity-40 transition">
                    {actionId === s._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button onClick={() => handleToggle(s)} disabled={actionId === s._id} title={s.active ? 'Pause' : 'Resume'}
                    className={`rounded-xl p-2 transition ${s.active ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'} disabled:opacity-40`}>
                    <Power className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(s._id)} disabled={actionId === s._id} title="Delete"
                    className="rounded-xl p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.22 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h3 className="font-bold text-gray-900">New recurring schedule</h3>
                <button onClick={() => setShowForm(false)} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Schedule label *</label>
                    <input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                      placeholder="e.g. Tuesday evening rice" className={inputCls} required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Repeat on *</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((d, i) => (
                        <button key={d} type="button" onClick={() => toggleDay(i)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${form.daysOfWeek.includes(i) ? 'bg-green-600 text-white' : 'border border-gray-200 text-gray-500 hover:border-green-300'}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Time *</label>
                    <input type="time" value={form.timeHHMM}
                      onChange={(e) => setForm((p) => ({ ...p, timeHHMM: e.target.value }))} className={inputCls} />
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Donation template</p>
                    <div className="space-y-3">
                      <input placeholder="Title *" value={form.template.title}
                        onChange={(e) => setForm((p) => ({ ...p, template: { ...p.template, title: e.target.value } }))}
                        className={inputCls} required />
                      <textarea placeholder="Description *" value={form.template.description} rows={2}
                        onChange={(e) => setForm((p) => ({ ...p, template: { ...p.template, description: e.target.value } }))}
                        className={`${inputCls} resize-none`} required />
                      <div className="flex gap-2">
                        <input type="number" min="1" placeholder="Qty" value={form.template.quantity}
                          onChange={(e) => setForm((p) => ({ ...p, template: { ...p.template, quantity: +e.target.value } }))}
                          className={`${inputCls} flex-1`} />
                        <select value={form.template.unit}
                          onChange={(e) => setForm((p) => ({ ...p, template: { ...p.template, unit: e.target.value } }))}
                          className="w-28 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20">
                          <option value="meals">Meals</option><option value="kg">kg</option><option value="boxes">Boxes</option>
                        </select>
                      </div>
                      <input placeholder="Pickup location *" value={form.template.pickup_location}
                        onChange={(e) => setForm((p) => ({ ...p, template: { ...p.template, pickup_location: e.target.value } }))}
                        className={inputCls} required />
                      <input placeholder="Contact number *" value={form.template.contact_number}
                        onChange={(e) => setForm((p) => ({ ...p, template: { ...p.template, contact_number: e.target.value } }))}
                        className={inputCls} required />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button type="submit"
                      className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700">
                      <CalendarClock className="h-4 w-4" />Create schedule
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecurringDonations;

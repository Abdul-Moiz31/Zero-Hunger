import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Save, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/utils/axios';

const FOOD_CATEGORIES = [
  'Cooked meals', 'Bakery & bread', 'Dairy', 'Fruits & vegetables', 'Canned goods',
  'Dry goods', 'Beverages', 'Frozen food', 'Snacks', 'Baby food',
];

const NGOPreferences: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    foodCategories: [] as string[],
    serviceAreas: [] as string[],
    maxQuantityKg: 0,
  });
  const [newArea, setNewArea] = useState('');

  useEffect(() => {
    api.get('/profiles/me').then((r) => {
      if (r.data?.preferences) setPrefs(r.data.preferences);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleCategory = (cat: string) =>
    setPrefs((p) => ({
      ...p,
      foodCategories: p.foodCategories.includes(cat)
        ? p.foodCategories.filter((c) => c !== cat)
        : [...p.foodCategories, cat],
    }));

  const addArea = () => {
    if (!newArea.trim()) return;
    setPrefs((p) => ({ ...p, serviceAreas: [...p.serviceAreas, newArea.trim()] }));
    setNewArea('');
  };

  const removeArea = (area: string) =>
    setPrefs((p) => ({ ...p, serviceAreas: p.serviceAreas.filter((a) => a !== area) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/profiles/me', { preferences: prefs });
      toast.success('Preferences saved!');
    } catch { toast.error('Failed to save preferences'); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-500" /></div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">NGO Preferences</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Tell us what food types and areas your NGO serves so we can surface the best matches
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save preferences
        </motion.button>
      </div>

      {/* Food categories */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-green-600" />
          <h3 className="font-bold text-gray-900">Food categories we accept</h3>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Select the food types your NGO can handle. Donors will be notified of matching donations first.
        </p>
        <div className="flex flex-wrap gap-2">
          {FOOD_CATEGORIES.map((cat) => {
            const active = prefs.foodCategories.includes(cat);
            return (
              <button key={cat} onClick={() => toggleCategory(cat)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-700'
                }`}>
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Service areas */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 font-bold text-gray-900">Service areas</h3>
        <p className="mb-4 text-sm text-gray-500">Add neighbourhoods or districts your NGO serves.</p>
        <div className="mb-3 flex gap-2">
          <input
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
            placeholder="e.g. Gulshan-e-Iqbal, Karachi"
            className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
          <button onClick={addArea}
            className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700">
            <Plus className="h-4 w-4" />Add
          </button>
        </div>
        {prefs.serviceAreas.length === 0 ? (
          <p className="text-sm text-gray-400">No areas added yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {prefs.serviceAreas.map((area) => (
              <div key={area} className="flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
                {area}
                <button onClick={() => removeArea(area)} className="text-green-400 hover:text-green-700 transition">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Max quantity */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-1 font-bold text-gray-900">Maximum quantity per donation</h3>
        <p className="mb-4 text-sm text-gray-500">
          Set a maximum kg threshold. Donations above this will be deprioritised in your feed.
          Set to 0 for no limit.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            value={prefs.maxQuantityKg}
            onChange={(e) => setPrefs((p) => ({ ...p, maxQuantityKg: +e.target.value }))}
            className="w-32 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
          <span className="text-sm text-gray-500">kg (0 = no limit)</span>
        </div>
      </div>
    </motion.div>
  );
};

export default NGOPreferences;

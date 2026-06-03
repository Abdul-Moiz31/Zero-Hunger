import React, { useState, useEffect } from 'react';
import { useNGOContext } from '@/contexts/ngoContext';
import type { InventoryData } from '@/contexts/ngoContext';
import { Package2, Utensils, CheckCircle, Tag, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const RANGE_OPTIONS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

const InventoryTab: React.FC = () => {
  const { getInventory } = useNGOContext();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (d: number) => {
    setLoading(true);
    try {
      const result = await getInventory(d);
      setData(result);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(days); }, [days]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Inventory Log</h2>
          <p className="text-sm text-gray-500">Completed deliveries received by your NGO</p>
        </div>
        <div className="relative">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-4 pr-9 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBox icon={CheckCircle} label="Total deliveries" value={data?.totalDeliveries ?? '—'} accent="green" />
        <StatBox icon={Utensils} label="Total meals received" value={data?.totalMeals ?? '—'} accent="blue" />
        <StatBox icon={Tag} label="Food categories" value={data?.categories.length ?? '—'} accent="violet" />
      </div>

      {/* Category breakdown */}
      {data && data.categories.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="h-4 w-4 text-violet-500" /> Food categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.categories.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-sm text-violet-700">
                {c.name}
                <span className="rounded-full bg-violet-200 px-1.5 py-0.5 text-xs font-semibold">{c.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Deliveries table */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <Package2 className="h-4 w-4 text-green-600" />
          <h3 className="font-semibold text-gray-900">Received donations</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-600" />
          </div>
        ) : !data || data.deliveries.length === 0 ? (
          <div className="py-14 text-center text-sm text-gray-400">
            No completed deliveries in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3">Donation</th>
                  <th className="px-5 py-3">Qty</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Donor</th>
                  <th className="px-5 py-3">Delivered by</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.deliveries.map((d) => (
                  <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{d.title}</td>
                    <td className="px-5 py-3 text-gray-600">{d.quantity} {d.unit}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
                        {d.dietary_info || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{d.donorId?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{d.volunteerId?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {d.delivered_time ? new Date(d.delivered_time).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ACCENT_CLASSES: Record<string, string> = {
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-50 text-violet-600',
};

const StatBox: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  accent: string;
}> = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
    <div className={`rounded-xl p-3 ${ACCENT_CLASSES[accent]}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default InventoryTab;

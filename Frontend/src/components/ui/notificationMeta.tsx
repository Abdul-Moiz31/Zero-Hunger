import { Bell, Package, HandHeart, Truck, CheckCircle2, UserCheck, ShieldCheck, Clock, type LucideIcon } from 'lucide-react';

export interface NotificationMeta {
  icon: LucideIcon;
  /** Tailwind classes for the icon chip. */
  chip: string;
  label: string;
}

/**
 * Maps a notification `type` to an icon, color, and human label so each
 * notification renders distinctly (the app emits typed notifications:
 * new_donation, claimed, assigned, in_progress, completed, approved, general).
 */
export function getNotificationMeta(type?: string): NotificationMeta {
  switch (type) {
    case 'new_donation':
      return { icon: Package, chip: 'bg-blue-50 text-blue-600', label: 'New donation' };
    case 'claimed':
      return { icon: HandHeart, chip: 'bg-amber-50 text-amber-600', label: 'Claimed' };
    case 'assigned':
      return { icon: Truck, chip: 'bg-violet-50 text-violet-600', label: 'Assigned' };
    case 'in_progress':
      return { icon: Truck, chip: 'bg-violet-50 text-violet-600', label: 'In progress' };
    case 'completed':
      return { icon: CheckCircle2, chip: 'bg-green-50 text-green-600', label: 'Completed' };
    case 'delivery_confirmed':
      return { icon: ShieldCheck, chip: 'bg-emerald-50 text-emerald-600', label: 'Delivery confirmed' };
    case 'expiry_alert':
      return { icon: Clock, chip: 'bg-red-50 text-red-600', label: 'Expiring soon' };
    case 'approved':
      return { icon: UserCheck, chip: 'bg-green-50 text-green-600', label: 'Approved' };
    default:
      return { icon: Bell, chip: 'bg-gray-100 text-gray-500', label: 'Update' };
  }
}

/** Human-friendly relative time, e.g. "2h ago". */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

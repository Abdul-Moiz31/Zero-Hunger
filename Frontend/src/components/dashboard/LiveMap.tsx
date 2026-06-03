import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Wifi, WifiOff } from 'lucide-react';
import { getSocket } from '@/utils/socket';

interface VolunteerPin {
  volunteerId: string;
  taskId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

interface LiveMapProps {
  claimedFoods: Array<{ _id: string; title: string; status: string; volunteerId?: { name: string; _id: string } }>;
}

export const LiveMap: React.FC<LiveMapProps> = ({ claimedFoods }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markers = useRef<Map<string, any>>(new Map());
  const [pins, setPins] = useState<VolunteerPin[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Dynamically load Leaflet (avoids SSR issues and keeps the bundle lean)
  useEffect(() => {
    let L: any;
    let mounted = true;

    const initMap = async () => {
      L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Fix default marker icon paths broken by bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mounted || !mapRef.current || leafletMap.current) return;

      leafletMap.current = L.map(mapRef.current).setView([30.3753, 69.3451], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(leafletMap.current);
    };

    initMap();
    return () => {
      mounted = false;
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  // Update markers whenever pins change
  useEffect(() => {
    const L_module = import('leaflet').then(({ default: L }) => {
      if (!leafletMap.current) return;

      pins.forEach((pin) => {
        const food = claimedFoods.find((f) => f._id === pin.taskId);
        const volunteerName = food?.volunteerId?.name || 'Volunteer';
        const label = food ? `${volunteerName} — ${food.title}` : volunteerName;

        const icon = L.divIcon({
          html: `<div class="relative"><div class="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">${volunteerName.charAt(0)}</div></div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        if (markers.current.has(pin.volunteerId)) {
          markers.current.get(pin.volunteerId)!.setLatLng([pin.lat, pin.lng]);
        } else {
          const marker = L.marker([pin.lat, pin.lng], { icon })
            .addTo(leafletMap.current!)
            .bindPopup(label);
          markers.current.set(pin.volunteerId, marker);
        }
      });

      // Fit map to all pins
      if (pins.length > 0) {
        const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng]));
        leafletMap.current!.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    });

    return () => { void L_module; };
  }, [pins, claimedFoods]);

  // Listen for volunteer location events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onLocation = (data: VolunteerPin) => {
      setPins((prev) => {
        const filtered = prev.filter((p) => p.volunteerId !== data.volunteerId);
        return [...filtered, data];
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('volunteer:location', onLocation);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('volunteer:location', onLocation);
    };
  }, []);

  const activeTasks = claimedFoods.filter((f) => f.status === 'in_progress');

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">Live Volunteer Map</h2>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
          {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </div>

      {activeTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <MapPin className="h-8 w-8 mb-3 opacity-40" />
          <p className="text-sm">No in-progress deliveries right now.</p>
          <p className="text-xs mt-1">Volunteer pins will appear here once they start sharing location.</p>
        </div>
      ) : (
        <>
          <div ref={mapRef} className="h-80 w-full" />
          <div className="p-3 border-t border-gray-50 flex flex-wrap gap-2">
            {pins.map((pin) => {
              const food = claimedFoods.find((f) => f._id === pin.taskId);
              return (
                <span key={pin.volunteerId} className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {food?.volunteerId?.name || 'Volunteer'} — {food?.title || pin.taskId}
                </span>
              );
            })}
            {activeTasks.filter((f) => !pins.some((p) => p.taskId === f._id)).map((f) => (
              <span key={f._id} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                {f.volunteerId?.name || 'Volunteer'} — awaiting location
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LiveMap;

import React, { useState } from 'react';
import { FloorMapZone } from '../../types';
import {
  MapPin,
  Plus,
  Users,
  Building,
  Layers,
  Sparkles,
  Info,
  Check,
  Edit2,
  X,
} from 'lucide-react';

interface FloorMapManagerProps {
  floorZones: FloorMapZone[];
  onAddZone: (zone: Omit<FloorMapZone, 'id'>) => void;
  onUpdateCapacity: (id: string, newCapacity: string) => void;
}

export const FloorMapManager: React.FC<FloorMapManagerProps> = ({
  floorZones = [],
  onAddZone,
  onUpdateCapacity,
}) => {
  const safeFloorZones = Array.isArray(floorZones) ? floorZones : [];
  const [selectedZone, setSelectedZone] = useState<FloorMapZone | null>(safeFloorZones[0] || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCapacityId, setEditingCapacityId] = useState<string | null>(null);
  const [tempCapacity, setTempCapacity] = useState('');

  // Form states for new zone
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('6 desks');
  const [category, setCategory] = useState<FloorMapZone['category']>('Workspace');
  const [description, setDescription] = useState('');

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddZone({
      companyId: 'acme',
      name: name.trim(),
      capacity: capacity.trim() || '4 desks',
      category,
      description: description.trim() || 'Configured office sector.',
      x: Math.floor(Math.random() * 40) + 20,
      y: Math.floor(Math.random() * 40) + 20,
      width: 26,
      height: 24,
      color: category === 'HR Desk' ? '#4f46e5' : category === 'Meeting Room' ? '#0284c7' : '#059669',
    });

    setName('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  const handleSaveCapacity = (id: string) => {
    if (tempCapacity.trim()) {
      onUpdateCapacity(id, tempCapacity.trim());
    }
    setEditingCapacityId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <span>Floor Map Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure designated office zones, desk allocations, and meeting areas connected to PolicyBot navigation triggers.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-cyan-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Floor Zone</span>
        </button>
      </div>

      {/* Main Grid: Interactive Blueprint Preview & Zones Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Floor Map Visual Blueprint */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col shadow-md">
          <div className="flex flex-wrap items-center justify-between mb-4 text-xs gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>HQ Level 2 Blueprint &bull; Interactive Zone Control</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block mr-1.5"></span> HR Desk</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-sky-500 inline-block mr-1.5"></span> Meeting Room</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5"></span> Workspace</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1.5"></span> Lounge</span>
            </div>
          </div>

          {/* SVG Map Layout */}
          <div className="relative w-full aspect-[16/10] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-3 select-none flex items-center justify-center">
            {/* Blueprint Grid Lines */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #38bdf8 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* Render interactive zones */}
            {safeFloorZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              const isHR = zone.category === 'HR Desk';

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  style={{
                    left: `${zone.x || 10}%`,
                    top: `${zone.y || 10}%`,
                    width: `${zone.width || 25}%`,
                    height: `${zone.height || 25}%`,
                  }}
                  className={`absolute rounded-xl p-2.5 cursor-pointer border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/80 shadow-lg shadow-cyan-500/20 scale-[1.02] z-20'
                      : isHR
                      ? 'border-indigo-500/60 bg-indigo-950/40 hover:bg-indigo-900/50'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isHR
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {zone.category}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">{zone.capacity}</span>
                  </div>

                  <div>
                    <h2 className="text-xs font-bold text-white line-clamp-1">{zone.name}</h2>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {zone.description || 'Configured workspace'}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow-sm">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}

            {/* Compass / Orientation Marker */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-md px-2.5 py-1 text-[10px] text-slate-400 font-mono">
              LEVEL 2 &bull; NORTH ELEVATORS &uarr;
            </div>
          </div>
        </div>

        {/* Right 1 Col: Selected Zone Details & Editor */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md">
          {selectedZone ? (
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                <Info className="w-4 h-4" />
                <span>Zone Details</span>
              </div>
              <h3 className="text-lg font-bold text-white">{selectedZone.name}</h3>
              <div className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium mt-1 mb-4">
                Category: {selectedZone.category}
              </div>

              <div className="space-y-4">
                {/* Capacity Editor */}
                <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Allocated Capacity:</span>
                    {editingCapacityId !== selectedZone.id && (
                      <button
                        onClick={() => {
                          setEditingCapacityId(selectedZone.id);
                          setTempCapacity(selectedZone.capacity);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center text-[11px] font-medium"
                      >
                        <Edit2 className="w-3 h-3 mr-1" /> Edit
                      </button>
                    )}
                  </div>

                  {editingCapacityId === selectedZone.id ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="text"
                        value={tempCapacity}
                        onChange={(e) => setTempCapacity(e.target.value)}
                        placeholder="e.g. 6 desks"
                        className="w-full px-2.5 py-1 bg-slate-900 border border-cyan-500 rounded-lg text-xs text-white"
                      />
                      <button
                        onClick={() => handleSaveCapacity(selectedZone.id)}
                        className="p-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCapacityId(null)}
                        className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-white font-mono">{selectedZone.capacity}</p>
                  )}
                </div>

                {/* Description */}
                <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">Zone Purpose / Description:</span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedZone.description || 'General office facility area.'}
                  </p>
                </div>

                {/* Chat Trigger info */}
                {selectedZone.category === 'HR Desk' && (
                  <div className="p-3.5 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-300 flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-indigo-300">AI Chat Trigger Bound</span>
                      <span className="text-[11px] text-slate-400 mt-0.5 block leading-relaxed">
                        When employees ask &ldquo;Where is the HR helpdesk?&rdquo;, the assistant generates a direct &ldquo;Highlight on Floor Map&rdquo; action pointing here.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Select a zone on the blueprint to view and edit details
            </div>
          )}

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
            Real-time synchronization with Employee Navigation Portal
          </div>
        </div>
      </div>

      {/* Add Zone Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span>Add Floor Map Zone</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Design Studio &bull; Pod 3C"
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FloorMapZone['category'])}
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                  >
                    <option value="HR Desk">HR Desk</option>
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Workspace">Workspace</option>
                    <option value="Common Area">Common Area</option>
                    <option value="Quiet Area">Quiet Area</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Capacity
                  </label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 8 desks"
                    className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description / Amenities
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High-refresh monitors, whiteboards, standing desks..."
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-[0.98]"
                >
                  Add Zone to Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

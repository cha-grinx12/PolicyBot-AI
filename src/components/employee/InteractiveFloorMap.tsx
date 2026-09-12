import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FloorMapZone } from '../../types';
import {
  MapPin,
  Users,
  Compass,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Check,
  Navigation,
  Footprints,
  Play,
  Square,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  LocateFixed,
  CornerUpRight,
  CornerUpLeft,
  ArrowUp,
  Volume2,
} from 'lucide-react';

interface InteractiveFloorMapProps {
  floorZones: FloorMapZone[];
  selectedZoneId?: string | null;
  highlightedZoneId?: string | null;
  onClearHighlight?: () => void;
  onClearSelection?: () => void;
}

interface NavigationStep {
  stepNumber: number;
  instruction: string;
  distance: string;
  icon: 'elevator' | 'straight' | 'turn-left' | 'turn-right' | 'destination';
  point: { x: number; y: number };
}

interface ZoneRoute {
  distanceMeters: number;
  etaSeconds: number;
  pathD: string;
  waypoints: { x: number; y: number }[];
  steps: NavigationStep[];
}

export const InteractiveFloorMap: React.FC<InteractiveFloorMapProps> = ({
  floorZones = [],
  selectedZoneId,
  highlightedZoneId,
  onClearHighlight,
  onClearSelection,
}) => {
  const safeZones = Array.isArray(floorZones) ? floorZones : [];
  const activeHighlightedId = selectedZoneId ?? highlightedZoneId;
  const handleClear = onClearSelection || onClearHighlight;
  const [selectedZone, setSelectedZone] = useState<FloorMapZone | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [attendantMessageSent, setAttendantMessageSent] = useState(false);

  // Indoor GPS Navigation States
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeHighlightedId) {
      const match = safeZones.find((z) => z.id === activeHighlightedId);
      if (match) {
        setSelectedZone(match);
        setCurrentStepIndex(0);
      }
    } else if (!selectedZone && safeZones.length > 0) {
      setSelectedZone(safeZones[0]);
    }
  }, [activeHighlightedId, safeZones]);

  // Reset navigation step when selected zone changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsNavigating(false);
    setIsAutoPlaying(false);
  }, [selectedZone?.id]);

  const categories = ['All', 'HR Desk', 'Meeting Room', 'Workspace', 'Common Area'];

  const filteredZones = safeZones.filter((zone) => {
    if (filterCategory === 'All') return true;
    return zone.category === filterCategory;
  });

  const handleSendMessageToAttendant = (attendantName: string, zoneName: string) => {
    setAttendantMessageSent(true);
    setTimeout(() => setAttendantMessageSent(false), 4000);
  };

  // -------------------------------------------------------------------
  // PATHFINDING & ROUTE CALCULATION (Google Maps for the Office)
  // -------------------------------------------------------------------
  // Fixed Start Node: Central Elevators & Main Atrium Entrance
  const START_NODE = { x: 50, y: 91, label: 'Central Elevators / Main Entrance' };

  const activeRoute: ZoneRoute | null = useMemo(() => {
    if (!selectedZone) return null;

    const destX = (selectedZone.x || 10) + (selectedZone.width || 25) / 2;
    const destY = (selectedZone.y || 10) + (selectedZone.height || 25) / 2;

    // Hallway corridor routing:
    // 1. Depart Elevators at (50, 91)
    // 2. Travel along Central Gallery Corridor to (50, destY)
    // 3. Turn into wing corridor to (destX, destY)
    const waypoints = [
      { x: START_NODE.x, y: START_NODE.y },
      { x: 50, y: destY },
      { x: destX, y: destY },
    ];

    const pathD = `M ${START_NODE.x} ${START_NODE.y} L 50 ${destY} L ${destX} ${destY}`;

    const dy = Math.abs(START_NODE.y - destY) * 0.55;
    const dx = Math.abs(50 - destX) * 0.65;
    const distanceMeters = Math.max(12, Math.round(dy + dx));
    const etaSeconds = Math.round(distanceMeters * 1.15);

    const isWest = destX < 50;
    const turnDir = isWest ? 'turn-left' : 'turn-right';
    const wingName = isWest ? 'West Wing' : 'East Wing';

    const steps: NavigationStep[] = [
      {
        stepNumber: 1,
        instruction: 'Exit Central Elevators lobby and proceed into Level 2 Atrium',
        distance: '0m',
        icon: 'elevator',
        point: { x: START_NODE.x, y: START_NODE.y },
      },
      {
        stepNumber: 2,
        instruction: `Walk straight north along the Central Gallery Corridor (${Math.round(dy)}m)`,
        distance: `${Math.round(dy * 0.4)}m`,
        icon: 'straight',
        point: { x: 50, y: (START_NODE.y + destY) / 2 },
      },
      {
        stepNumber: 3,
        instruction: `Turn ${isWest ? 'left' : 'right'} into ${wingName} corridor toward ${selectedZone.name}`,
        distance: `${Math.round(dy)}m`,
        icon: turnDir as any,
        point: { x: 50, y: destY },
      },
      {
        stepNumber: 4,
        instruction: `Arrive at ${selectedZone.name} entrance door`,
        distance: `${distanceMeters}m`,
        icon: 'destination',
        point: { x: destX, y: destY },
      },
    ];

    return {
      distanceMeters,
      etaSeconds,
      pathD,
      waypoints,
      steps,
    };
  }, [selectedZone]);

  // Handle Autoplay Step Animation
  useEffect(() => {
    if (isAutoPlaying && isNavigating && activeRoute) {
      autoPlayTimerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= activeRoute.steps.length - 1) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, isNavigating, activeRoute]);

  const handleToggleNavigation = () => {
    if (isNavigating) {
      setIsNavigating(false);
      setIsAutoPlaying(false);
      setCurrentStepIndex(0);
    } else {
      setIsNavigating(true);
      setCurrentStepIndex(0);
    }
  };

  const handleNextStep = () => {
    if (!activeRoute) return;
    setCurrentStepIndex((prev) => Math.min(prev + 1, activeRoute.steps.length - 1));
  };

  const handlePrevStep = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-950/50">
              <Navigation className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Indoor GPS Pathfinder & Spatial Navigator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time workplace pathfinding, interactive turn-by-turn guidance, and live desk occupancy for Level 2.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto p-1 bg-slate-900/90 border border-slate-800 rounded-xl self-start sm:self-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap active:scale-[0.98] ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notice if redirected from PolicyBot AI */}
      {activeHighlightedId && selectedZone && (
        <div className="p-4 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border border-cyan-500/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-cyan-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold animate-pulse shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>Direct Navigation Target:</span>
                <span className="text-cyan-300 font-extrabold">{selectedZone.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activeRoute ? `${activeRoute.distanceMeters}m walk` : 'Active'}
                </span>
              </p>
              <p className="text-[11px] text-slate-300">
                Route highlighted with glowing pathfinder corridor. Click &quot;Start Indoor Navigation&quot; for turn-by-turn guidance.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleNavigation}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                isNavigating
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isNavigating ? 'Stop Navigation' : 'Start Indoor Navigation'}</span>
            </button>
            {handleClear && (
              <button
                onClick={handleClear}
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Map & Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Floor Blueprint (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 text-xs gap-2">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Acme Corp &bull; HQ Level 2 Floor Pathfinder</span>
              {activeRoute && (
                <span className="text-[11px] font-mono text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800/60">
                  {activeRoute.distanceMeters}m &bull; ~{activeRoute.etaSeconds}s
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>You Are Here</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Target Pin</span>
              </span>
            </div>
          </div>

          {/* TURN-BY-TURN HUD NAVIGATION OVERLAY (When Navigating) */}
          {isNavigating && activeRoute && (
            <div className="mb-3 p-3 bg-slate-950/95 border border-cyan-500/50 rounded-xl text-white shadow-xl shadow-cyan-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0">
                  {activeRoute.steps[currentStepIndex].icon === 'turn-left' ? (
                    <CornerUpLeft className="w-5 h-5 text-cyan-400" />
                  ) : activeRoute.steps[currentStepIndex].icon === 'turn-right' ? (
                    <CornerUpRight className="w-5 h-5 text-cyan-400" />
                  ) : activeRoute.steps[currentStepIndex].icon === 'destination' ? (
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ArrowUp className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      Step {currentStepIndex + 1} of {activeRoute.steps.length}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      &bull; Distance: {activeRoute.steps[currentStepIndex].distance}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-100">
                    {activeRoute.steps[currentStepIndex].instruction}
                  </p>
                </div>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-750 transition"
                  title="Previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-1">
                  {activeRoute.steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition ${
                        idx === currentStepIndex
                          ? 'bg-cyan-400 ring-2 ring-cyan-400/40'
                          : idx < currentStepIndex
                          ? 'bg-emerald-400'
                          : 'bg-slate-700'
                      }`}
                      title={`Jump to step ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNextStep}
                  disabled={currentStepIndex === activeRoute.steps.length - 1}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 border border-slate-750 transition"
                  title="Next step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                    isAutoPlaying
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-900 text-slate-300 border border-slate-750 hover:bg-slate-800'
                  }`}
                  title="Auto-walk simulation"
                >
                  {isAutoPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span className="text-[11px]">{isAutoPlaying ? 'Pause' : 'Auto Walk'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Blueprint Canvas Container */}
          <div
            id="canvas-indoor-floormap"
            className="relative w-full aspect-[16/10] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-3 select-none flex items-center justify-center"
          >
            {/* Grid & Floor Guidelines Background */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #38bdf8 1.5px, transparent 1.5px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Architectural Hallway Corridors (Light gray walkways) */}
            {/* Vertical Main Central Gallery Hallway */}
            <div className="absolute left-[48%] top-[18%] w-[4%] h-[74%] bg-slate-900/60 border-x border-slate-800/80 pointer-events-none flex items-center justify-center">
              <span className="text-[8px] tracking-widest text-slate-600 uppercase -rotate-90 select-none font-mono">
                CENTRAL ATRIUM CORRIDOR
              </span>
            </div>
            {/* Horizontal North Corridor */}
            <div className="absolute left-[15%] top-[29%] w-[70%] h-[5%] bg-slate-900/60 border-y border-slate-800/80 pointer-events-none flex items-center justify-center">
              <span className="text-[8px] tracking-widest text-slate-600 uppercase select-none font-mono">
                NORTH CROSSWAY (ZONE 2A - 2B)
              </span>
            </div>
            {/* Horizontal South Corridor */}
            <div className="absolute left-[15%] top-[70%] w-[70%] h-[5%] bg-slate-900/60 border-y border-slate-800/80 pointer-events-none flex items-center justify-center">
              <span className="text-[8px] tracking-widest text-slate-600 uppercase select-none font-mono">
                SOUTH COMMONS WAY (POD ALPHA - BISTRO)
              </span>
            </div>

            {/* SVG OVERLAY: GLOWING ROUTE PATHFINDER */}
            {activeRoute && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Glowing Route Drop Shadow */}
                  <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {/* Linear Gradient for route direction */}
                  <linearGradient id="routeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="60%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>

                {/* Outer route glow halo */}
                <path
                  d={activeRoute.pathD}
                  stroke="#06b6d4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity="0.5"
                  filter="url(#route-glow)"
                />

                {/* Animated inner pulsating path line */}
                <path
                  d={activeRoute.pathD}
                  stroke="url(#routeGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 2"
                  fill="none"
                  className="animate-pulse"
                />

                {/* Waypoint Turning Nodes */}
                {activeRoute.waypoints.map((wp, idx) => (
                  <g key={idx}>
                    <circle cx={wp.x} cy={wp.y} r="2" fill="#06b6d4" opacity="0.4" />
                    <circle cx={wp.x} cy={wp.y} r="1" fill="#ffffff" />
                  </g>
                ))}
              </svg>
            )}

            {/* STARTING PULSE MARKER: "📍 YOU ARE HERE" (Central Elevators / Main Entrance) */}
            <div
              className="absolute z-25 pointer-events-auto cursor-pointer"
              style={{
                left: `${START_NODE.x}%`,
                top: `${START_NODE.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title="Central Elevators / Main Floor Entrance"
            >
              <div className="relative flex items-center justify-center">
                {/* Concentric radar ripple pulse */}
                <span className="absolute w-8 h-8 rounded-full bg-emerald-400 opacity-60 animate-ping"></span>
                <span className="absolute w-5 h-5 rounded-full bg-emerald-500/40 ring-2 ring-emerald-400"></span>
                {/* Core pin */}
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-500/80 ring-2 ring-slate-950 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>

                {/* Floating "YOU ARE HERE" Badge */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>📍 YOU ARE HERE (Central Elevators)</span>
                </div>
              </div>
            </div>

            {/* ACTIVE INDOOR WALKER BEACON (When Navigating) */}
            {isNavigating && activeRoute && (
              <div
                className="absolute z-30 transition-all duration-700 ease-in-out pointer-events-none"
                style={{
                  left: `${activeRoute.steps[currentStepIndex].point.x}%`,
                  top: `${activeRoute.steps[currentStepIndex].point.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/80 ring-2 ring-white font-black text-[11px]">
                    🧭
                  </div>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-cyan-950 text-cyan-300 border border-cyan-500/50 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded whitespace-nowrap">
                    Step {currentStepIndex + 1}
                  </span>
                </div>
              </div>
            )}

            {/* RENDER INTERACTIVE ZONES */}
            {filteredZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              const isPulsingTarget = activeHighlightedId === zone.id;
              const isHR = zone.category === 'HR Desk';

              return (
                <div
                  key={zone.id}
                  id={`employee-zone-${zone.id}`}
                  onClick={() => {
                    setSelectedZone(zone);
                    setIsNavigating(false);
                    setCurrentStepIndex(0);
                  }}
                  style={{
                    left: `${zone.x || 10}%`,
                    top: `${zone.y || 10}%`,
                    width: `${zone.width || 25}%`,
                    height: `${zone.height || 25}%`,
                  }}
                  className={`absolute rounded-xl p-3 cursor-pointer border-2 transition-all flex flex-col justify-between select-none ${
                    isPulsingTarget
                      ? 'border-cyan-400 ring-4 ring-cyan-400 animate-pulse bg-cyan-500/30 shadow-2xl shadow-cyan-400/50 scale-105 z-30'
                      : isSelected
                      ? 'border-cyan-400 bg-cyan-950/80 shadow-lg shadow-cyan-500/25 scale-[1.02] z-20'
                      : isHR
                      ? 'border-indigo-500/60 bg-indigo-950/40 hover:bg-indigo-900/50'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-850/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isHR
                          ? 'bg-indigo-600 text-white font-mono'
                          : isPulsingTarget
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {zone.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{zone.capacity}</span>
                  </div>

                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center space-x-1">
                      {isHR && <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 inline shrink-0" />}
                      <span className="truncate">{zone.name}</span>
                    </h2>
                    {zone.statusText ? (
                      <p className="text-[10px] text-emerald-400 font-semibold truncate mt-0.5">
                        {zone.statusText}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {zone.description || 'Workspace area'}
                      </p>
                    )}
                  </div>

                  {/* DESTINATION TARGET PIN ON SELECTED ZONE CARD */}
                  {isSelected && (
                    <div
                      id={`pin-destination-${zone.id}`}
                      className="absolute -top-3 -right-3 flex items-center space-x-1 z-30"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-cyan-500/50 animate-bounce ring-2 ring-white">
                        🎯
                      </div>
                      {activeRoute && (
                        <span className="hidden sm:inline-block bg-slate-950 border border-cyan-500/50 text-cyan-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md font-mono">
                          {activeRoute.distanceMeters}m
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Map Orientation Badges */}
            <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-400 flex items-center space-x-1.5 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-300">NORTH (WEST &bull; EAST WING)</span>
            </div>
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] text-slate-400 font-mono flex items-center space-x-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>LEVEL 2 &bull; ZONES 2A - 2D &bull; LIVE PATHFINDER</span>
            </div>
          </div>
        </div>

        {/* Selected Zone Details & Navigation Sidebar (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm space-y-4">
          {selectedZone ? (
            <div className="space-y-4">
              {/* Header Info */}
              <div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                  <Info className="w-4 h-4" />
                  <span>Zone Specifications & Live Status</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{selectedZone.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-medium">
                    Category: {selectedZone.category}
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-xs text-slate-400">Capacity: {selectedZone.capacity}</span>
                </div>
              </div>

              {/* INDOOR GPS NAVIGATION ACTION BUTTON */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/50 border border-cyan-500/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Indoor Pathfinding</span>
                  </span>
                  {activeRoute && (
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {activeRoute.distanceMeters} meters &bull; ~{activeRoute.etaSeconds} sec
                    </span>
                  )}
                </div>

                <button
                  id="btn-toggle-indoor-navigation"
                  type="button"
                  onClick={handleToggleNavigation}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold shadow-md transition active:scale-[0.98] flex items-center justify-center space-x-2 ${
                    isNavigating
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                      : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-900/40'
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  <span>{isNavigating ? '⏹️ Stop Navigation' : '🧭 Start Indoor Navigation'}</span>
                </button>
              </div>

              {/* MINIATURE VISUAL MAP CARD WITH ROUTE HIGHLIGHT */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Walking Radar Thumbnail</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">From Central Elevators</span>
                </div>

                {/* Mini SVG Radar Thumbnail */}
                <div className="relative w-full h-24 bg-slate-900/90 rounded-lg border border-slate-800/80 overflow-hidden flex items-center justify-center p-2">
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                      backgroundSize: '12px 12px',
                    }}
                  />

                  {/* Mini Blueprint SVG */}
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Mini Hallways */}
                    <rect x="47" y="15" width="6" height="75" fill="#1e293b" opacity="0.7" />
                    <rect x="15" y="28" width="70" height="6" fill="#1e293b" opacity="0.7" />
                    <rect x="15" y="68" width="70" height="6" fill="#1e293b" opacity="0.7" />

                    {/* Mini Route Line */}
                    {activeRoute && (
                      <path
                        d={activeRoute.pathD}
                        stroke="#06b6d4"
                        strokeWidth="3.5"
                        strokeDasharray="4 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        className="animate-pulse"
                      />
                    )}

                    {/* Start Mini Dot */}
                    <circle cx="50" cy="91" r="3.5" fill="#10b981" />
                    {/* Target Mini Dot */}
                    {activeRoute && (
                      <circle
                        cx={activeRoute.waypoints[2].x}
                        cy={activeRoute.waypoints[2].y}
                        r="4"
                        fill="#06b6d4"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    )}
                  </svg>

                  {/* Badges on mini map */}
                  <div className="absolute bottom-1 right-1.5 text-[9px] font-mono text-cyan-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                    ADA Accessible &bull; Level Walk
                  </div>
                </div>
              </div>

              {/* Live Occupancy & Attendant */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    Occupancy & Wait Time
                  </span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                    {selectedZone.statusText || '🟢 Available & Open'}
                  </span>
                </div>
                {selectedZone.attendant && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Attendant on Duty</span>
                    <span className="text-xs font-semibold text-indigo-300">{selectedZone.attendant}</span>
                  </div>
                )}
              </div>

              {/* Message Desk Attendant Button */}
              {selectedZone.attendant && (
                <div>
                  {attendantMessageSent ? (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Ping sent to {selectedZone.attendant}. Expected response at desk: &lt; 5 mins.
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendMessageToAttendant(selectedZone.attendant!, selectedZone.name)}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-[0.98] flex items-center justify-center space-x-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message Desk Attendant ({selectedZone.attendant})</span>
                    </button>
                  )}
                </div>
              )}

              {/* Walking Directions Text with Turn Indicators */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-xs space-y-2">
                <span className="text-cyan-300 font-semibold block flex items-center space-x-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Walking Directions from Central Elevators:</span>
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedZone.category === 'HR Desk'
                    ? 'Exit elevator lobby on Level 2, turn right into the East Wing Corridor. Follow signs for Zone 2B (adjacent to executive suites). Reception desk staffed by Claire Admin.'
                    : selectedZone.category === 'Meeting Room'
                    ? 'Exit elevator lobby, turn left into the Boardroom hallway. Room entrance is equipped with an electronic touch scheduler and acoustic soundproofing.'
                    : selectedZone.category === 'Workspace'
                    ? 'Exit elevator lobby and turn left into South-West Pod Alpha. Open workstation layout with dual-monitor motorized standing desks.'
                    : 'Located through the double acoustic glass doors directly ahead of the atrium stairs, adjacent to cold brew and espresso bar.'}
                </p>

                {/* Step-by-Step breakdown */}
                {activeRoute && (
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Turn-by-Turn Waypoints:
                    </span>
                    {activeRoute.steps.map((st, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setIsNavigating(true);
                          setCurrentStepIndex(i);
                        }}
                        className={`flex items-start space-x-2 p-1.5 rounded-lg cursor-pointer transition text-[11px] ${
                          isNavigating && currentStepIndex === i
                            ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-500/40 font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[9px] font-mono font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-snug">{st.instruction}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Select an area on the floor map to view directions and capacity.
            </div>
          )}

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Level 2 Spatial Operations</span>
            <span className="text-emerald-400 font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Live Sync Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

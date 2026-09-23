import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Layers, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Filter, 
  RotateCcw,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Building, Property } from '../../types';

interface TowerFloorSectionProps {
  building: Building;
  properties: Property[];
  selectedTower: string | null;
  selectedFloor: number | string | null;
  onSelectTower: (tower: string | null) => void;
  onSelectFloor: (floor: number | string | null) => void;
  onOpenEnquiry: (property?: Property) => void;
}

export interface FloorItem {
  id: string;
  floorNumber: number | string;
  label: string;
  levelType: 'basement' | 'ground' | 'mezzanine' | 'floor';
  matchingProperties: Property[];
}

export const TowerFloorSection: React.FC<TowerFloorSectionProps> = ({
  building,
  properties,
  selectedTower,
  selectedFloor,
  onSelectTower,
  onSelectFloor,
  onOpenEnquiry
}) => {
  const [viewMode, setViewMode] = useState<'stack' | 'grid'>('grid');

  // Available towers for this building
  const towersList = useMemo(() => {
    if (building.towers && Array.isArray(building.towers) && building.towers.length > 0) {
      return building.towers;
    }
    return ['Main Tower'];
  }, [building.towers]);

  // Active tower defaulting to first tower if not set
  const activeTower = selectedTower || (towersList.length > 1 ? towersList[0] : towersList[0]);

  // Determine property counts per tower
  const towerPropertyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    towersList.forEach(t => {
      counts[t] = properties.filter(p => {
        if (p.tower) return p.tower.toLowerCase() === t.toLowerCase();
        // Fallback to checking title, address or description
        const text = `${p.title} ${p.address} ${p.description}`.toLowerCase();
        return text.includes(t.toLowerCase());
      }).length;
    });
    return counts;
  }, [properties, towersList]);

  // Generate complete floor spectrum for the building
  const allFloors = useMemo<FloorItem[]>(() => {
    const items: FloorItem[] = [];
    const totalFloors = Number(building.total_floors) || 14;
    const basementStr = building.basement_floors || '';
    const groundOption = building.ground_option || 'Ground (G)';

    // 1. Superstructure floors (top down: totalFloors down to 1)
    for (let f = totalFloors; f >= 1; f--) {
      // Find properties matching this floor & active tower
      const matching = properties.filter(p => {
        // Tower check
        const matchesTower = !activeTower || 
          (p.tower && p.tower.toLowerCase() === activeTower.toLowerCase()) ||
          (!p.tower && `${p.title} ${p.address}`.toLowerCase().includes(activeTower.toLowerCase())) ||
          towersList.length === 1;

        if (!matchesTower) return false;

        // Floor check
        const pFloor = p.floor !== undefined && p.floor !== null ? String(p.floor).trim() : '';
        if (pFloor === String(f)) return true;
        
        // Also check if address or title says e.g. "5th Floor"
        const floorRegex = new RegExp(`\\b${f}(?:st|nd|rd|th)?\\s*floor\\b`, 'i');
        return floorRegex.test(`${p.title} ${p.address} ${p.description}`);
      });

      items.push({
        id: `floor-${f}`,
        floorNumber: f,
        label: `${f}${f === 1 ? 'st' : f === 2 ? 'nd' : f === 3 ? 'rd' : 'th'} Floor`,
        levelType: 'floor',
        matchingProperties: matching
      });
    }

    // 2. Ground / Mezzanine Level
    if (groundOption.includes('Mezzanine') || groundOption.includes('M')) {
      const mezzMatching = properties.filter(p => {
        const text = `${p.title} ${p.address} ${p.floor}`.toLowerCase();
        return text.includes('mezzanine');
      });
      items.push({
        id: 'floor-mezzanine',
        floorNumber: 'Mezzanine',
        label: 'Mezzanine Level (M)',
        levelType: 'mezzanine',
        matchingProperties: mezzMatching
      });
    }

    const groundMatching = properties.filter(p => {
      const pFloor = p.floor !== undefined && p.floor !== null ? String(p.floor).trim().toLowerCase() : '';
      if (pFloor === '0' || pFloor === 'g' || pFloor.includes('ground')) return true;
      const text = `${p.title} ${p.address}`.toLowerCase();
      return text.includes('ground floor');
    });

    items.push({
      id: 'floor-ground',
      floorNumber: 'G',
      label: groundOption === 'Ground Only' ? 'Ground Floor (Single Level)' : 'Ground Floor (G)',
      levelType: 'ground',
      matchingProperties: groundMatching
    });

    // 3. Basements (B1, B2, B3, ...)
    let basementCount = 0;
    if (basementStr.includes('5')) basementCount = 5;
    else if (basementStr.includes('4')) basementCount = 4;
    else if (basementStr.includes('3')) basementCount = 3;
    else if (basementStr.includes('2')) basementCount = 2;
    else if (basementStr.includes('1') || basementStr.toLowerCase().includes('single')) basementCount = 1;
    else if (building.parking && building.parking.toLowerCase().includes('3-level')) basementCount = 3;
    else if (building.parking && (building.parking.toLowerCase().includes('double') || building.parking.toLowerCase().includes('covered basement'))) basementCount = 2;
    else if (totalFloors >= 4 && basementStr !== 'No Basement') basementCount = 2;

    for (let b = 1; b <= basementCount; b++) {
      items.push({
        id: `floor-b${b}`,
        floorNumber: `B${b}`,
        label: basementCount === 1 ? 'Basement Level (B1)' : `Basement Level ${b} (B${b})`,
        levelType: 'basement',
        matchingProperties: []
      });
    }

    return items;
  }, [building, properties, activeTower, towersList]);

  // Selected floor details object
  const activeFloorItem = useMemo(() => {
    if (selectedFloor === null || selectedFloor === undefined) return null;
    return allFloors.find(f => String(f.floorNumber).toLowerCase() === String(selectedFloor).toLowerCase()) || null;
  }, [allFloors, selectedFloor]);

  const handleTowerClick = (tower: string) => {
    onSelectTower(tower);
  };

  const handleFloorClick = (floorItem: FloorItem) => {
    if (selectedFloor !== null && String(selectedFloor) === String(floorItem.floorNumber)) {
      onSelectFloor(null); // toggle off
    } else {
      onSelectFloor(floorItem.floorNumber);
    }
  };

  const handleClearFilters = () => {
    onSelectFloor(null);
  };

  return (
    <section className="glass-card rounded-3xl p-6 sm:p-8 bg-white/70 dark:bg-[#0B132B]/75 border border-slate-200/90 dark:border-slate-800 space-y-6 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/80">
              Campus & Tower Architecture
            </span>
            {towersList.length > 1 && (
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800">
                {towersList.length} Connected Towers
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-brand-500" />
            <span>Multi-Tower & Floor Options</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Navigate specific commercial tower blocks and floor plates inside {building.name}. Click any floor to view available listings or enquire directly.
          </p>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Floor Matrix
          </button>
          <button
            type="button"
            onClick={() => setViewMode('stack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'stack'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vertical Stack
          </button>
        </div>
      </div>

      {/* 1. Interactive Tower Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-brand-500" />
          <span>Step 1: Select Tower / Block</span>
        </label>

        <div className="flex flex-wrap gap-2 pt-1">
          {towersList.map((towerName) => {
            const isSelected = activeTower.toLowerCase() === towerName.toLowerCase();
            const unitCount = towerPropertyCounts[towerName] || 0;

            return (
              <button
                key={towerName}
                type="button"
                onClick={() => handleTowerClick(towerName)}
                className={`group px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                <Building2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-brand-500'}`} />
                <span>{towerName}</span>
                {unitCount > 0 ? (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-white text-brand-700'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {unitCount} {unitCount === 1 ? 'Unit' : 'Units'}
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-medium ${
                      isSelected ? 'text-brand-100' : 'text-slate-400'
                    }`}
                  >
                    Campus Wing
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Primary Hierarchy Breadcrumb: e.g. I-Thum → Tower A → 5th Floor */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-50/80 via-cyan-50/50 to-brand-50/80 dark:from-brand-950/40 dark:via-cyan-950/30 dark:to-brand-950/40 border border-brand-200/70 dark:border-brand-800/60 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold">
          <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1">
            Hierarchy:
          </span>
          
          {/* Building */}
          <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>{building.name}</span>
          </span>

          <ChevronRight className="w-4 h-4 text-brand-500 shrink-0" />

          {/* Tower */}
          <span className="px-2.5 py-1 rounded-xl bg-brand-600 text-white font-bold flex items-center gap-1.5 shadow-2xs">
            <span>{activeTower}</span>
          </span>

          <ChevronRight className="w-4 h-4 text-brand-500 shrink-0" />

          {/* Floor */}
          <span className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs border ${
            selectedFloor !== null
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}>
            <Layers className="w-3.5 h-3.5" />
            <span>
              {activeFloorItem ? activeFloorItem.label : 'Select Floor Level'}
            </span>
          </span>
        </div>

        {/* Action / Reset */}
        <div className="flex items-center gap-2">
          {selectedFloor !== null && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Show All Floors</span>
            </button>
          )}

          {activeFloorItem && activeFloorItem.matchingProperties.length === 0 && (
            <button
              type="button"
              onClick={() => onOpenEnquiry(properties[0] || undefined)}
              className="btn-glass-primary px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Enquire for {activeTower} - {activeFloorItem.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Interactive Floor Options (Grid or Stack view) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-500" />
            <span>Step 2: Floor Options for {activeTower}</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {allFloors.filter(f => f.matchingProperties.length > 0).length} floor(s) with live vacancies
          </span>
        </div>

        {viewMode === 'grid' ? (
          /* Grid View of Floors */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {allFloors.map((item) => {
              const isSelected = selectedFloor !== null && String(selectedFloor) === String(item.floorNumber);
              const hasUnits = item.matchingProperties.length > 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFloorClick(item)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer border relative flex flex-col justify-between min-h-[76px] ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/80 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                      : hasUnits
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 border-emerald-300/80 dark:border-emerald-800/80'
                      : 'bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-xs font-bold ${
                      isSelected 
                        ? 'text-brand-700 dark:text-brand-300' 
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {item.label}
                    </span>
                    {hasUnits && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    {hasUnits ? (
                      <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600 text-white">
                        {item.matchingProperties.length} {item.matchingProperties.length === 1 ? 'Unit Available' : 'Units Available'}
                      </span>
                    ) : item.levelType === 'basement' ? (
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        Car Parking
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        Corporate Floor
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Vertical Architectural Stack View */
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {allFloors.map((item) => {
              const isSelected = selectedFloor !== null && String(selectedFloor) === String(item.floorNumber);
              const hasUnits = item.matchingProperties.length > 0;

              return (
                <div
                  key={item.id}
                  onClick={() => handleFloorClick(item)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/80 border-brand-500 ring-2 ring-brand-500/20'
                      : hasUnits
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 border-emerald-300/80 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300">
                      {item.floorNumber}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.levelType === 'basement' ? 'Dedicated Parking & Services' : `${activeTower} Corporate Floor`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasUnits ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{item.matchingProperties.length} Available Unit(s)</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        Corporate Space
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Floor Banner / Quick CTA */}
      {activeFloorItem && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Active Selection:
            </span>
            <span className="font-bold text-brand-600 dark:text-brand-400">
              {building.name} → {activeTower} → {activeFloorItem.label}
            </span>
            <span className="text-slate-400">
              ({activeFloorItem.matchingProperties.length} active listing{activeFloorItem.matchingProperties.length === 1 ? '' : 's'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer underline text-[11px]"
            >
              Reset to All Floors
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { motion, AnimatePresence } from 'motion/react';
import { Info, Map as MapIcon, X, TrendingUp, Award } from 'lucide-react';
import { cn } from '../lib/utils';

// India TopoJSON URL
const INDIA_TOPO_JSON = "https://raw.githubusercontent.com/HindustanTimesLabs/shapefiles/master/india/states/india_states.json";

interface StateData {
  id: string;
  name: string;
  turnout: number;
  stronghold: string;
  lastWinner: string;
  seats: number;
}

const indianStatesData: Record<string, StateData> = {
  "Maharashtra": { id: "MH", name: "Maharashtra", turnout: 61.1, stronghold: "NDA", lastWinner: "NDA", seats: 48 },
  "Uttar Pradesh": { id: "UP", name: "Uttar Pradesh", turnout: 59.1, stronghold: "BJP", lastWinner: "BJP", seats: 80 },
  "West Bengal": { id: "WB", name: "West Bengal", turnout: 81.7, stronghold: "TMC", lastWinner: "TMC", seats: 42 },
  "Tamil Nadu": { id: "TN", name: "Tamil Nadu", turnout: 72.4, stronghold: "DMK", lastWinner: "DMK", seats: 39 },
  "Karnataka": { id: "KA", name: "Karnataka", turnout: 68.8, stronghold: "BJP/INC", lastWinner: "BJP", seats: 28 },
  "Gujarat": { id: "GJ", name: "Gujarat", turnout: 64.1, stronghold: "BJP", lastWinner: "BJP", seats: 26 },
  "Rajasthan": { id: "RJ", name: "Rajasthan", turnout: 66.3, stronghold: "BJP", lastWinner: "BJP", seats: 25 },
  "Kerala": { id: "KL", name: "Kerala", turnout: 77.7, stronghold: "UDF/LDF", lastWinner: "UDF", seats: 20 },
  "Bihar": { id: "BR", name: "Bihar", turnout: 57.3, stronghold: "NDA/INDIA", lastWinner: "NDA", seats: 40 },
  "Madhya Pradesh": { id: "MP", name: "Madhya Pradesh", turnout: 71.2, stronghold: "BJP", lastWinner: "BJP", seats: 29 },
  "Andhra Pradesh": { id: "AP", name: "Andhra Pradesh", turnout: 79.8, stronghold: "YSRCP/TDP", lastWinner: "YSRCP", seats: 25 },
  "Telangana": { id: "TG", name: "Telangana", turnout: 62.7, stronghold: "BRS/INC", lastWinner: "BRS", seats: 17 },
  "Odisha": { id: "OR", name: "Odisha", turnout: 73.1, stronghold: "BJD", lastWinner: "BJD", seats: 21 },
  "Punjab": { id: "PB", name: "Punjab", turnout: 65.9, stronghold: "AAP/INC", lastWinner: "INC", seats: 13 },
  "Assam": { id: "AS", name: "Assam", turnout: 81.5, stronghold: "BJP", lastWinner: "BJP", seats: 14 },
  "Jharkhand": { id: "JH", name: "Jharkhand", turnout: 66.8, stronghold: "BJP/JMM", lastWinner: "NDA", seats: 14 },
  "Chhattisgarh": { id: "CT", name: "Chhattisgarh", turnout: 71.5, stronghold: "BJP", lastWinner: "BJP", seats: 11 },
  "Haryana": { id: "HR", name: "Haryana", turnout: 70.3, stronghold: "BJP", lastWinner: "BJP", seats: 10 },
  "Delhi": { id: "DL", name: "Delhi", turnout: 60.6, stronghold: "AAP/BJP", lastWinner: "BJP", seats: 7 },
  "Jammu & Kashmir": { id: "JK", name: "Jammu & Kashmir", turnout: 44.9, stronghold: "JKNC/BJP", lastWinner: "JKNC", seats: 5 },
  "Uttarakhand": { id: "UT", name: "Uttarakhand", turnout: 61.5, stronghold: "BJP", lastWinner: "BJP", seats: 5 },
  "Himachal Pradesh": { id: "HP", name: "Himachal Pradesh", turnout: 72.4, stronghold: "BJP", lastWinner: "BJP", seats: 4 },
};

export function IndiaMap() {
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");

  const colorScale = scaleQuantile<string>()
    .domain(Object.values(indianStatesData).map(d => d.turnout))
    .range([
      "#dee2e6",
      "#ced4da",
      "#adb5bd",
      "#6c757d",
      "#495057",
      "#343a40"
    ]);

  // Fallback for states not in our data
  const getFillColor = (stateName: string) => {
    const data = indianStatesData[stateName];
    if (data) return colorScale(data.turnout);
    return "#f1f5f9";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm mx-5 overflow-hidden relative">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <MapIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">State-wise Insights</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Interactive Map of India</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Scale</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: colorScale.range()[i-1] }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full flex items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-100/50">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1000,
              center: [82, 22] // Center of India
            }}
            className="w-full h-full"
          >
            <Geographies geography={INDIA_TOPO_JSON}>
              {({ geographies }) =>
                geographies?.map((geo) => {
                  const stateName = geo.properties.ST_NM;
                  const isSelected = selectedState?.name === stateName;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        setTooltipContent(stateName);
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("");
                      }}
                      onClick={() => {
                        if (indianStatesData[stateName]) {
                          setSelectedState(indianStatesData[stateName]);
                        }
                      }}
                      style={{
                        default: {
                          fill: isSelected ? "#1a2a6c" : getFillColor(stateName),
                          stroke: "#fff",
                          strokeWidth: 0.5,
                          outline: "none",
                          transition: "all 250ms ease"
                        },
                        hover: {
                          fill: "#f08000",
                          stroke: "#fff",
                          strokeWidth: 1,
                          outline: "none",
                          cursor: "pointer"
                        },
                        pressed: {
                          fill: "#1a2a6c",
                          stroke: "#fff",
                          strokeWidth: 1,
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {tooltipContent && !selectedState && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-lg text-[10px] font-bold text-slate-800 uppercase tracking-widest z-10 pointer-events-none">
              {tooltipContent}
            </div>
          )}

          {!selectedState && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">Tap on a state for details</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedState && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-x-5 bottom-5 bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-6 z-20"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">{selectedState.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-bold uppercase tracking-widest border border-indigo-100">
                      State ID: {selectedState.id}
                    </span>
                    <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded-lg font-bold uppercase tracking-widest border border-slate-100">
                      {selectedState.seats} Seats
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedState(null)}
                  className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-primary opacity-70">
                    <TrendingUp size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Turnout</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800">{selectedState.turnout}%</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Historical Average</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-success opacity-70">
                    <Award size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Stronghold</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800">{selectedState.stronghold}</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Major Influence</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-indigo-600/5 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 navy-brand text-white rounded-lg flex items-center justify-center text-xs font-bold">
                    {selectedState.lastWinner.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Last Winner (2019)</p>
                    <p className="text-sm font-bold text-slate-800">{selectedState.lastWinner}</p>
                  </div>
                </div>
                <Info size={14} className="text-indigo-300" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-5">
        <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
            <Info size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 mb-1 tracking-tight">Geopolitical Fact</p>
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
              Uttar Pradesh remains the most significant state with 80 Lok Sabha seats, often said to determine the course of Indian politics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

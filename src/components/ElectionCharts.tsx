
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Users, PieChart as PieIcon } from 'lucide-react';

const turnoutData = [
  { year: '1951', turnout: 44.8 },
  { year: '1962', turnout: 55.4 },
  { year: '1977', turnout: 60.5 },
  { year: '1991', turnout: 56.9 },
  { year: '2004', turnout: 58.1 },
  { year: '2014', turnout: 66.4 },
  { year: '2019', turnout: 67.4 },
];

const genderData = [
  { era: '2014', Male: 67.1, Female: 65.6 },
  { era: '2019', Male: 67.0, Female: 67.2 },
];

const seatData = [
  { name: 'National Parties', value: 397 },
  { name: 'State Parties', value: 114 },
  { name: 'Unrecognised', value: 27 },
  { name: 'Independent', value: 5 },
];

const historicalPartyData = [
  { name: 'BJP', value: 303, color: '#FF9933' },
  { name: 'INC', value: 52, color: '#19AAED' },
  { name: 'DMK', value: 24, color: '#D40000' },
  { name: 'AITC', value: 22, color: '#20C646' },
  { name: 'YSRCP', value: 22, color: '#0033CC' },
  { name: 'Others', value: 120, color: '#808080' },
];

const COLORS = ['#1a2a6c', '#f08000', '#228b22', '#7c7c7c'];

export function ElectionCharts() {
  return (
    <div className="space-y-12 pb-10">
      {/* Voter Turnout Trend */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm mx-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 text-primary rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Voter Turnout Trends</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">General Elections (1951-2019)</p>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={turnoutData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
                dy={10}
              />
              <YAxis 
                domain={[40, 75]} 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
                width={30}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="turnout" 
                stroke="#1a2a6c" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#1a2a6c', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-400 mt-4 text-center italic">India saw its highest ever turnout in 2019 at 67.4%</p>
      </section>

      {/* Gender Participation */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm mx-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Gender Participation</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Turnout % Comparison</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={genderData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="era" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
                dy={10}
              />
              <YAxis 
                domain={[60, 70]} 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
                width={30}
              />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              <Bar dataKey="Male" fill="#1a2a6c" radius={[4, 4, 0, 0]} barSize={25} />
              <Bar dataKey="Female" fill="#f08000" radius={[4, 4, 0, 0]} barSize={25} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Seat Distribution (Historical Representation) */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm mx-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 text-green-600 rounded-xl">
            <PieIcon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Political Landscape</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Distribution of Roles</p>
          </div>
        </div>

        <div className="h-64 w-full flex flex-col items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={seatData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {seatData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
            {seatData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Historical Party Seat Distribution */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm mx-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <PieIcon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">2019 Seat Distribution</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Performance by Major Parties</p>
          </div>
        </div>

        <div className="h-72 w-full flex flex-col items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={historicalPartyData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {historicalPartyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '1rem', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
            Source: Election Commission of India (2019 Results)
          </p>
        </div>
      </section>
    </div>
  );
}

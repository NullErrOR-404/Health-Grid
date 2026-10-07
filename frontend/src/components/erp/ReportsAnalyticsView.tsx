import React, { useState, useEffect } from 'react';
import {
  Users,
  Stethoscope,
  Bed,
  IndianRupee,
  Calendar,
  Download,
  TrendingUp,
  Clock,
  ArrowRight,
  FileSpreadsheet,
  Printer,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  reportsAnalyticsService,
  type ReportsAnalyticsData,
} from '../../services/reportsAnalyticsService';

interface ReportsAnalyticsViewProps {
  triggerToast: (msg: string) => void;
}

const DONUT_COLORS = ['#0ea5e9', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#94a3b8'];
const PATIENT_TYPE_COLORS = ['#0ea5e9', '#14b8a6', '#f43f5e'];

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({
  triggerToast,
}) => {
  const [data, setData] = useState<ReportsAnalyticsData | null>(() =>
    reportsAnalyticsService.getAnalytics()
  );
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Patient Flow' | 'Clinical' | 'Financial' | 'Operational' | 'Department Wise'
  >('Overview');
  const [dateRange, setDateRange] = useState('01 Sep 2025 - 29 Sep 2025');
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setData(reportsAnalyticsService.getAnalytics());
    };
    const unsubscribe = reportsAnalyticsService.subscribe(handleUpdate);
    reportsAnalyticsService.computeAnalytics().then((res) => setData(res));

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDateRangeSelect = (range: string) => {
    setDateRange(range);
    setIsDateRangeOpen(false);
    reportsAnalyticsService.setDateRange(range);
    triggerToast(`Reporting period updated to: ${range}`);
  };

  const handleExportCSV = () => {
    reportsAnalyticsService.exportReportCSV();
    setIsExportMenuOpen(false);
    triggerToast('Hospital Analytics CSV generated and downloaded successfully!');
  };

  const handleExportPDF = () => {
    setIsExportMenuOpen(false);
    triggerToast('Opening printable clinical summary report...');
    setTimeout(() => {
      reportsAnalyticsService.exportReportPDF();
    }, 400);
  };

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Aggregating longitudinal hospital database records...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] overflow-y-auto">
      {/* 1. TOP HEADER & DATE RANGE / EXPORT CONTROLS */}
      <div className="p-4 lg:p-6 pb-2 border-b border-slate-200/80 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports &amp; Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Get insights into hospital operations, patient care, clinical outcomes and financial performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Date Range Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDateRangeOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95">
                {[
                  '01 Sep 2025 - 29 Sep 2025',
                  'Today (Live)',
                  'Last 7 Days',
                  'Last 30 Days',
                  'This Quarter (Q3 2025)',
                  'Year to Date (2025-26)',
                ].map((range) => (
                  <button
                    key={range}
                    onClick={() => handleDateRangeSelect(range)}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${
                      dateRange === range
                        ? 'bg-teal-50 text-teal-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export Report</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export as CSV (.csv)</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>Print Clinical Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. 4 TOP KPI METRIC CARDS */}
      <div className="p-4 lg:p-6 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Patients */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Total Patients</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {data.totalPatients.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>↑ {data.totalPatientsGrowth}% vs last month</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: OPD Visits */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">OPD Visits</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {data.opdVisits.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>↑ {data.opdVisitsGrowth}% vs last month</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: IPD Admissions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">IPD Admissions</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {data.ipdAdmissions.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>↑ {data.ipdAdmissionsGrowth}% vs last month</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shadow-xs">
              <Bed className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Total Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Total Revenue</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {data.totalRevenueDisplay}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>↑ {data.totalRevenueGrowth}% vs last month</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-1 border-b border-slate-200/80 overflow-x-auto text-xs pb-1">
          {[
            { id: 'Overview', label: 'Overview' },
            { id: 'Patient Flow', label: 'Patient Flow' },
            { id: 'Clinical', label: 'Clinical' },
            { id: 'Financial', label: 'Financial' },
            { id: 'Operational', label: 'Operational' },
            { id: 'Department Wise', label: 'Department Wise' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-teal-50 text-teal-700 shadow-2xs border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. MAIN CONTENT ACCORDING TO ACTIVE TAB */}
      <div className="p-4 lg:p-6 space-y-6">
        {/* ================= TAB 1: OVERVIEW (Matching Visual Reference) ================= */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            {/* ROW 1: Patient Trend (Line/Area) & Department Wise OPD Visits (Donut) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Patient Trend Card (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Patient Trend</h2>
                    <p className="text-[11px] text-slate-400">Longitudinal outpatient vs inpatient volume</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
                      <span>OPD Visits</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                      <span>IPD Admissions</span>
                    </span>
                  </div>
                </div>

                {/* Smooth Curve Area Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.patientTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOpd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorIpd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 200]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="opdVisits"
                        name="OPD Visits"
                        stroke="#0ea5e9"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorOpd)"
                      />
                      <Area
                        type="monotone"
                        dataKey="ipdAdmissions"
                        name="IPD Admissions"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorIpd)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Department Wise OPD Visits Donut Card (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-900">Department Wise OPD Visits</h2>
                  <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    Total: {data.opdVisits}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center py-2 flex-1">
                  {/* Donut Chart with Center Text */}
                  <div className="sm:col-span-6 h-48 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.departmentDistribution}
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="visits"
                        >
                          {data.departmentDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-black text-slate-900">{data.opdVisits}</span>
                      <span className="text-[10px] font-semibold text-slate-400">Visits</span>
                    </div>
                  </div>

                  {/* Legend List */}
                  <div className="sm:col-span-6 space-y-1.5 text-xs">
                    {data.departmentDistribution.map((dept, idx) => (
                      <div key={dept.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                          />
                          <span className="text-slate-600 font-medium truncate max-w-[110px]">
                            {dept.name}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">{dept.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: Patient Type Distribution + Bed Occupancy Rate + Revenue Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Card 1: Patient Type Distribution (4 Cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div className="mb-2">
                  <h2 className="text-sm font-bold text-slate-900">Patient Type Distribution</h2>
                  <p className="text-[11px] text-slate-400">Admission modality breakdown</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center py-2 flex-1">
                  {/* Donut Chart */}
                  <div className="sm:col-span-6 h-40 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.patientTypeDistribution}
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={4}
                          dataKey="count"
                        >
                          {data.patientTypeDistribution.map((_, index) => (
                            <Cell key={`type-${index}`} fill={PATIENT_TYPE_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-sm font-black text-slate-900">{data.totalPatients}</span>
                      <span className="text-[9px] font-semibold text-slate-400">Patients</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="sm:col-span-6 space-y-2 text-xs">
                    {data.patientTypeDistribution.map((pt, idx) => (
                      <div key={pt.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: PATIENT_TYPE_COLORS[idx] }}
                          />
                          <span className="text-slate-700 font-medium">{pt.type}</span>
                        </div>
                        <span className="font-bold text-slate-900">{pt.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: Bed Occupancy Rate (4 Cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-900">Bed Occupancy Rate</h2>
                  <span className="text-[10px] font-bold text-slate-500">Live Ward Sensors</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center py-2 flex-1">
                  {/* Gauge/Donut */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center text-center">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#14b8a6"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * data.bedOccupancy.overallRate) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-base font-black text-slate-900">{data.bedOccupancy.overallRate}%</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">
                      {data.bedOccupancy.occupiedBeds} / {data.bedOccupancy.totalBeds} Beds Occupied
                    </span>
                  </div>

                  {/* Ward Breakdown Bars */}
                  <div className="sm:col-span-7 space-y-2 text-xs">
                    {data.bedOccupancy.wards.map((w) => (
                      <div key={w.name}>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                          <span>{w.name}</span>
                          <span className="font-bold text-slate-900">{w.rate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${w.rate}%`, backgroundColor: w.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Revenue Overview (Stacked Bar) (4 Cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-900">Revenue Overview</h2>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#0ea5e9]" />
                      <span>OPD</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                      <span>IPD</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                      <span>Pharmacy</span>
                    </span>
                  </div>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueOverview} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="opd" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="ipd" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="pharmacy" stackId="a" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ROW 3: Top 5 Departments by Revenue & Key Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Top 5 Departments by Revenue (6 Cols) */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-900">Top 5 Departments by Revenue</h2>
                  <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    Total: {data.totalRevenueDisplay}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
                    <span className="col-span-1">#</span>
                    <span className="col-span-4">Department</span>
                    <span className="col-span-3 text-right">Revenue</span>
                    <span className="col-span-2 text-right">% Share</span>
                    <span className="col-span-2 text-right">Trend</span>
                  </div>

                  {data.topDepartmentsByRevenue.map((dept) => (
                    <div key={dept.rank} className="grid grid-cols-12 items-center text-xs py-1">
                      <span className="col-span-1 w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {dept.rank}
                      </span>
                      <span className="col-span-4 font-bold text-slate-800">{dept.department}</span>
                      <span className="col-span-3 text-right font-black text-slate-900">
                        {dept.revenueDisplay}
                      </span>
                      <span className="col-span-2 text-right font-semibold text-slate-600">
                        {dept.percentage}%
                      </span>
                      <div className="col-span-2 pl-3">
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-600 h-full rounded-full"
                            style={{ width: `${dept.percentage * 2.5}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Insights Card (6 Cols) */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                    <h2 className="text-sm font-bold text-slate-900">Key Insights</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('Clinical')}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <span>View Detailed Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {data.keyInsights.map((insight) => {
                    const isGrowth = insight.type === 'growth';
                    const isAlert = insight.type === 'alert';
                    const isRevenue = insight.type === 'revenue';

                    return (
                      <div
                        key={insight.id}
                        className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-start gap-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isGrowth
                              ? 'bg-emerald-50 text-emerald-600'
                              : isAlert
                              ? 'bg-rose-50 text-rose-600'
                              : isRevenue
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          {isGrowth && <TrendingUp className="w-4 h-4" />}
                          {isAlert && <Bed className="w-4 h-4" />}
                          {isRevenue && <IndianRupee className="w-4 h-4" />}
                          {!isGrowth && !isAlert && !isRevenue && <Clock className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-900 leading-snug">
                            {insight.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {insight.description}
                          </div>
                        </div>

                        {insight.metricBadge && (
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                              isGrowth
                                ? 'bg-emerald-50 text-emerald-700'
                                : isAlert
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {insight.metricBadge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PATIENT FLOW ================= */}
        {activeTab === 'Patient Flow' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Peak Footfall Hours</span>
                <div className="text-xl font-black text-slate-900 mt-1">{data.patientFlow.peakHours}</div>
                <div className="text-[11px] text-slate-400 mt-1">High registration queue at Central OPD</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Average Triage Wait Time</span>
                <div className="text-xl font-black text-teal-700 mt-1">{data.patientFlow.avgWaitTimeDisplay}</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">↓ 22% improvement from prior month</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Active Bottleneck</span>
                <div className="text-xl font-black text-rose-600 mt-1">{data.patientFlow.bottleneckDepartment}</div>
                <div className="text-[11px] text-slate-400 mt-1">Specialist queue exceeds 25 patients</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Hourly Patient Inflow Curve</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.patientFlow.hourlyArrivals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="opd" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.15} name="OPD Footfall" />
                    <Area type="monotone" dataKey="emergency" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} name="Emergency ER" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: CLINICAL ================= */}
        {activeTab === 'Clinical' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Overall Recovery Rate</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">{data.clinicalOutcomes.recoveryRate}%</div>
                <div className="text-[11px] text-slate-400 mt-1">NABH Clinical Benchmark: &gt;95%</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Avg. Length of Stay (ALOS)</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{data.clinicalOutcomes.avgLengthOfStayDays} Days</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Optimum bed turnaround</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">ICU Mortality Rate</span>
                <div className="text-2xl font-black text-rose-500 mt-1">{data.clinicalOutcomes.icuMortalityRate}%</div>
                <div className="text-[11px] text-slate-400 mt-1">Tertiary multi-trauma baseline</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">30-Day Readmission</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{data.clinicalOutcomes.readmissionRate30Days}%</div>
                <div className="text-[11px] text-slate-400 mt-1">Chronic follow-up compliance</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: FINANCIAL ================= */}
        {activeTab === 'Financial' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Billing Collection Efficiency</span>
                <div className="text-2xl font-black text-teal-700 mt-1">{data.financialPerformance.collectionEfficiency}%</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Zero bad debts reported</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Insurance Claims Settled</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{data.financialPerformance.insuranceClaimsSettled}%</div>
                <div className="text-[11px] text-slate-400 mt-1">TPA auto-adjudication speed: 4h</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Pharmacy Gross Margin</span>
                <div className="text-2xl font-black text-amber-600 mt-1">{data.financialPerformance.pharmacyGrossMargin}%</div>
                <div className="text-[11px] text-slate-400 mt-1">Jan Aushadhi generic dispensary</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: OPERATIONAL ================= */}
        {activeTab === 'Operational' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Bed Turnover Interval</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{data.operationalMetrics.bedTurnoverIntervalHours} Hours</div>
                <div className="text-[11px] text-slate-400 mt-1">Sanitization to next admission</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">OT Suite Utilization</span>
                <div className="text-2xl font-black text-teal-700 mt-1">{data.operationalMetrics.otUtilizationRate}%</div>
                <div className="text-[11px] text-slate-400 mt-1">Scheduled vs emergency surgeries</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Lab Diagnostic Turnaround</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{data.operationalMetrics.labTestTurnaroundTimeMins} Mins</div>
                <div className="text-[11px] text-slate-400 mt-1">STAT automated analyzers</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: DEPARTMENT WISE ================= */}
        {activeTab === 'Department Wise' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hospital Department Performance Matrix</h3>
                <p className="text-[11px] text-slate-400">Comparing clinical volume, staffing, and revenue</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Head of Dept</th>
                    <th className="py-3 px-4 text-right">OPD Footfall</th>
                    <th className="py-3 px-4 text-right">IPD Admissions</th>
                    <th className="py-3 px-4 text-right">Revenue</th>
                    <th className="py-3 px-4 text-right">Bed Occupancy</th>
                    <th className="py-3 px-4 text-right">Physicians</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.departmentWiseMatrix.map((dept) => (
                    <tr key={dept.department} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{dept.department}</td>
                      <td className="py-3 px-4 text-slate-600">{dept.headOfDept}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">{dept.opdFootfall}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">{dept.ipdAdmissions}</td>
                      <td className="py-3 px-4 text-right font-black text-teal-700">{dept.revenue}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{dept.bedOccupancy}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">{dept.doctorsCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

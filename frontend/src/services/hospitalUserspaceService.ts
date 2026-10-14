export interface HospitalMetrics {
  todayOpd: number;
  ipdPatients: number;
  totalBeds: number;
  availableBeds: number;
  occupancyPercentage: number;
  labOrdersTotal: number;
  labOrdersPending: number;
  labOrdersCompleted: number;
  pharmacyAlerts: number;
  todayRevenue: string;
  revenueVsYesterday: string;
  revenueBreakdown: Array<{ label: string; amount: string; dot: string }>;
}

export interface HospitalAppointment {
  id: string;
  time: string;
  name: string;
  dept: string;
  doctor: string;
  status: string;
  statusColor: string;
}

export interface HospitalAdmission {
  id: string;
  name: string;
  age: string;
  dept: string;
  time: string;
  status: string;
}

export interface HospitalTask {
  id: string;
  title: string;
  dept: string;
  priority: 'High' | 'Medium' | 'Low';
  color: string;
}

export interface HospitalAlert {
  id: string;
  title: string;
  sub: string;
  type: 'emergency' | 'biomedical' | 'pharmacy' | 'lab';
}

export interface HospitalUserspaceData {
  hospitalCode: string;
  hospitalName: string;
  metrics: HospitalMetrics;
  appointments: HospitalAppointment[];
  admissions: HospitalAdmission[];
  tasks: HospitalTask[];
  alerts: HospitalAlert[];
}

const STORAGE_PREFIX = 'healthgrid_erp_userspace_';

// Seed dataset for Govt Medical College & Hospital (HG-H002) - Clean Dynamic Baseline
const GMCH_SEED: HospitalUserspaceData = {
  hospitalCode: 'HG-H002',
  hospitalName: 'Govt Medical College & Hospital',
  metrics: {
    todayOpd: 0,
    ipdPatients: 0,
    totalBeds: 26,
    availableBeds: 26,
    occupancyPercentage: 0,
    labOrdersTotal: 0,
    labOrdersPending: 0,
    labOrdersCompleted: 0,
    pharmacyAlerts: 0,
    todayRevenue: '₹ 0',
    revenueVsYesterday: '₹ 0 vs yesterday',
    revenueBreakdown: [
      { label: 'OPD Consultations & Scheme', amount: '₹ 0', dot: 'bg-blue-600' },
      { label: 'IPD Admissions & Wards', amount: '₹ 0', dot: 'bg-teal-500' },
      { label: 'Pharmacy Bulk Dispensary', amount: '₹ 0', dot: 'bg-amber-500' },
      { label: 'Govt Scheme Reimbursements', amount: '₹ 0', dot: 'bg-purple-500' },
      { label: 'Radiology & Trauma Scans', amount: '₹ 0', dot: 'bg-indigo-500' },
    ],
  },
  appointments: [],
  admissions: [],
  tasks: [
    { id: 'gmch-tsk-1', title: 'State Health Mission census upload', dept: 'Administration', priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'gmch-tsk-2', title: 'Casualty trauma triage readiness', dept: 'Emergency', priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'gmch-tsk-3', title: 'Blood bank inventory sync', dept: 'Blood Bank', priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'gmch-tsk-4', title: 'Free drug dispensation quota sync', dept: 'Pharmacy', priority: 'Low', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ],
  alerts: [
    { id: 'gmch-alt-1', title: 'Emergency triage readiness verified', sub: 'Casualty • Just now', type: 'emergency' },
    { id: 'gmch-alt-2', title: 'Liquid Oxygen Primary Plant pressure nominal', sub: 'Biomedical • 15 min ago', type: 'biomedical' },
  ],
};

// Seed dataset for City Care Hospital (HG-H001) - Clean Dynamic Baseline
const CITYCARE_SEED: HospitalUserspaceData = {
  hospitalCode: 'HG-H001',
  hospitalName: 'City Care Hospital',
  metrics: {
    todayOpd: 0,
    ipdPatients: 0,
    totalBeds: 120,
    availableBeds: 120,
    occupancyPercentage: 0,
    labOrdersTotal: 0,
    labOrdersPending: 0,
    labOrdersCompleted: 0,
    pharmacyAlerts: 0,
    todayRevenue: '₹ 0',
    revenueVsYesterday: '₹ 0 vs yesterday',
    revenueBreakdown: [
      { label: 'OPD Consultations', amount: '₹ 0', dot: 'bg-blue-600' },
      { label: 'IPD Admissions & Wards', amount: '₹ 0', dot: 'bg-teal-500' },
      { label: 'Pharmacy Dispensary', amount: '₹ 0', dot: 'bg-amber-500' },
      { label: 'Laboratory Diagnostics', amount: '₹ 0', dot: 'bg-purple-500' },
      { label: 'Radiology & Imaging', amount: '₹ 0', dot: 'bg-indigo-500' },
    ],
  },
  appointments: [],
  admissions: [],
  tasks: [
    { id: 'cc-tsk-1', title: 'Lab reports awaiting verification', dept: 'Laboratory', priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'cc-tsk-2', title: 'Discharge summaries pending', dept: 'Inpatient', priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ],
  alerts: [
    { id: 'cc-alt-1', title: 'Triage systems operational', sub: 'Emergency • Just now', type: 'emergency' },
  ],
};

export const createDefaultUserspace = (hospitalCode: string, hospitalName: string, totalBeds = 100, availableBeds = 100): HospitalUserspaceData => {
  const code = hospitalCode.toUpperCase();
  if (code === 'HG-H002') return JSON.parse(JSON.stringify(GMCH_SEED));
  if (code === 'HG-H001') return JSON.parse(JSON.stringify(CITYCARE_SEED));

  return {
    hospitalCode,
    hospitalName,
    metrics: {
      todayOpd: 0,
      ipdPatients: 0,
      totalBeds,
      availableBeds,
      occupancyPercentage: 0,
      labOrdersTotal: 0,
      labOrdersPending: 0,
      labOrdersCompleted: 0,
      pharmacyAlerts: 0,
      todayRevenue: '₹ 0',
      revenueVsYesterday: '₹ 0 vs yesterday',
      revenueBreakdown: [
        { label: 'OPD Consultations', amount: '₹ 0', dot: 'bg-blue-600' },
        { label: 'IPD Ward Care', amount: '₹ 0', dot: 'bg-teal-500' },
        { label: 'Pharmacy Dispensary', amount: '₹ 0', dot: 'bg-amber-500' },
        { label: 'Diagnostics & Lab', amount: '₹ 0', dot: 'bg-purple-500' },
      ],
    },
    appointments: [],
    admissions: [],
    tasks: [
      { id: `tsk-1`, title: 'Facility accreditation sync', dept: 'Admin', priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { id: `tsk-2`, title: 'Staff shift roster confirmation', dept: 'Nursing', priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    ],
    alerts: [
      { id: `alt-1`, title: 'Facility Userspace Initialized (Clean Dynamic)', sub: 'System • Just now', type: 'biomedical' },
    ],
  };
};

export const getHospitalUserspace = (
  hospitalCode: string,
  hospitalName = 'Hospital Facility',
  totalBeds = 26,
  availableBeds = 26
): HospitalUserspaceData => {
  const key = `${STORAGE_PREFIX}${hospitalCode.toUpperCase()}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hospitalCode) {
        // Purge any legacy mock appointments
        if (Array.isArray(parsed.appointments)) {
          parsed.appointments = parsed.appointments.filter((a: any) =>
            !a.id?.startsWith('gmch-apt-') &&
            !a.id?.startsWith('cc-apt-') &&
            a.name !== 'Murugan Velu' &&
            a.name !== 'Ananthi Raman' &&
            a.name !== 'Selvi Govindan' &&
            a.name !== 'Muthu Krishnan' &&
            a.name !== 'Deepa Sundaram' &&
            a.name !== 'Priya Sharma' &&
            a.name !== 'Initial Facility Patient'
          );
        }
        // Purge any legacy mock admissions
        if (Array.isArray(parsed.admissions)) {
          parsed.admissions = parsed.admissions.filter((a: any) =>
            !a.id?.startsWith('gmch-adm-') &&
            !a.id?.startsWith('cc-adm-') &&
            a.name !== 'Palani Murugan' &&
            a.name !== 'Kavitha N' &&
            a.name !== 'Arumugam R' &&
            a.name !== 'Baby of Geetha' &&
            a.name !== 'Sundaram Pillai' &&
            a.name !== 'Suresh Rajan' &&
            a.name !== 'General Inpatient'
          );
        }

        // Recalculate metrics dynamically based on clean live data
        if (parsed.metrics) {
          const capBeds = hospitalCode.toUpperCase() === 'HG-H002' ? 26 : (parsed.metrics.totalBeds || totalBeds);
          const liveAdmissionsCount = parsed.admissions?.length || 0;
          parsed.metrics.totalBeds = capBeds;
          parsed.metrics.ipdPatients = liveAdmissionsCount;
          parsed.metrics.availableBeds = Math.max(0, capBeds - liveAdmissionsCount);
          parsed.metrics.occupancyPercentage = Math.round((liveAdmissionsCount / Math.max(capBeds, 1)) * 100);
          parsed.metrics.todayOpd = parsed.appointments?.length || 0;
          if (parsed.metrics.todayOpd === 0) {
            parsed.metrics.todayRevenue = '₹ 0';
            parsed.metrics.revenueVsYesterday = '₹ 0 vs yesterday';
          }
        }

        try {
          localStorage.setItem(key, JSON.stringify(parsed));
        } catch {
          // ignore
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn(`Error loading userspace for ${hospitalCode}:`, e);
  }

  const initial = createDefaultUserspace(hospitalCode, hospitalName, totalBeds, availableBeds);
  try {
    localStorage.setItem(key, JSON.stringify(initial));
  } catch (e) {
    console.warn('Error caching default userspace:', e);
  }
  return initial;
};

export const saveHospitalUserspace = (data: HospitalUserspaceData): void => {
  const key = `${STORAGE_PREFIX}${data.hospitalCode.toUpperCase()}`;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Error saving userspace for ${data.hospitalCode}:`, e);
  }
};

export const registerPatientInUserspace = (
  hospitalCode: string,
  patientName: string
): HospitalUserspaceData => {
  const current = getHospitalUserspace(hospitalCode);
  const newAppointment: HospitalAppointment = {
    id: `apt-${Date.now()}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    name: patientName,
    dept: 'OPD - Registration & Triage',
    doctor: 'Triage Officer',
    status: 'Checked In',
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const updated: HospitalUserspaceData = {
    ...current,
    metrics: {
      ...current.metrics,
      todayOpd: current.metrics.todayOpd + 1,
    },
    appointments: [newAppointment, ...current.appointments],
  };
  saveHospitalUserspace(updated);
  return updated;
};

export const bookAppointmentInUserspace = (
  hospitalCode: string,
  patientName: string,
  dept = 'OPD - General Medicine',
  doctor = 'Consulting Specialist',
  time = '11:30 AM'
): HospitalUserspaceData => {
  const current = getHospitalUserspace(hospitalCode);
  const newAppointment: HospitalAppointment = {
    id: `apt-${Date.now()}`,
    time,
    name: patientName,
    dept,
    doctor,
    status: 'Checked In',
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const updated: HospitalUserspaceData = {
    ...current,
    metrics: {
      ...current.metrics,
      todayOpd: current.metrics.todayOpd + 1,
    },
    appointments: [newAppointment, ...current.appointments],
  };
  saveHospitalUserspace(updated);
  return updated;
};

export const admitPatientInUserspace = (
  hospitalCode: string,
  patientName: string,
  age = '42 / M',
  dept = 'Inpatient Ward'
): HospitalUserspaceData => {
  const current = getHospitalUserspace(hospitalCode);
  const newAdmission: HospitalAdmission = {
    id: `adm-${Date.now()}`,
    name: patientName,
    age,
    dept,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Admitted',
  };

  const updatedAvailable = Math.max(0, current.metrics.availableBeds - 1);
  const updatedIpd = current.metrics.ipdPatients + 1;
  const occupancy = Math.round(((current.metrics.totalBeds - updatedAvailable) / Math.max(current.metrics.totalBeds, 1)) * 100);

  const updated: HospitalUserspaceData = {
    ...current,
    metrics: {
      ...current.metrics,
      availableBeds: updatedAvailable,
      ipdPatients: updatedIpd,
      occupancyPercentage: occupancy,
    },
    admissions: [newAdmission, ...current.admissions],
  };
  saveHospitalUserspace(updated);
  return updated;
};

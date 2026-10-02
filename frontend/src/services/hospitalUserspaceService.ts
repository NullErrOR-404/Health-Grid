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

// Seed dataset for Govt Medical College & Hospital (HG-H002)
const GMCH_SEED: HospitalUserspaceData = {
  hospitalCode: 'HG-H002',
  hospitalName: 'Govt Medical College & Hospital',
  metrics: {
    todayOpd: 540,
    ipdPatients: 382,
    totalBeds: 450,
    availableBeds: 68,
    occupancyPercentage: 85,
    labOrdersTotal: 94,
    labOrdersPending: 34,
    labOrdersCompleted: 60,
    pharmacyAlerts: 8,
    todayRevenue: '₹ 4,82,500',
    revenueVsYesterday: '↑ 14% vs yesterday',
    revenueBreakdown: [
      { label: 'OPD Consultations & Scheme', amount: '₹ 2,10,400', dot: 'bg-blue-600' },
      { label: 'IPD Admissions & Wards', amount: '₹ 1,48,000', dot: 'bg-teal-500' },
      { label: 'Pharmacy Bulk Dispensary', amount: '₹ 46,200', dot: 'bg-amber-500' },
      { label: 'Govt Scheme Reimbursements', amount: '₹ 52,900', dot: 'bg-purple-500' },
      { label: 'Radiology & Trauma Scans', amount: '₹ 25,000', dot: 'bg-indigo-500' },
    ],
  },
  appointments: [
    {
      id: 'gmch-apt-1',
      time: '09:00 AM',
      name: 'Murugan Velu',
      dept: 'OPD - General Medicine',
      doctor: 'Dr. K. Srinivasan (Dean)',
      status: 'Checked In',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'gmch-apt-2',
      time: '09:30 AM',
      name: 'Ananthi Raman',
      dept: 'OPD - Emergency & Trauma',
      doctor: 'Dr. Balamurugan',
      status: 'In Consultation',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'gmch-apt-3',
      time: '10:00 AM',
      name: 'Selvi Govindan',
      dept: 'OPD - Pediatrics',
      doctor: 'Dr. Meenakshi S',
      status: 'Waiting',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'gmch-apt-4',
      time: '10:30 AM',
      name: 'Muthu Krishnan',
      dept: 'OPD - Cardiology',
      doctor: 'Dr. Rajeshwari K',
      status: 'Scheduled',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'gmch-apt-5',
      time: '11:00 AM',
      name: 'Deepa Sundaram',
      dept: 'OPD - Obstetrics',
      doctor: 'Dr. Revathi K',
      status: 'Scheduled',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ],
  admissions: [
    { id: 'gmch-adm-1', name: 'Palani Murugan', age: '52 / M', dept: 'Emergency Medicine', time: '10:45 AM', status: 'Admitted' },
    { id: 'gmch-adm-2', name: 'Kavitha N', age: '38 / F', dept: 'Maternity Ward', time: '09:30 AM', status: 'In OT' },
    { id: 'gmch-adm-3', name: 'Arumugam R', age: '64 / M', dept: 'Pulmonology', time: '08:50 AM', status: 'Admitted' },
    { id: 'gmch-adm-4', name: 'Baby of Geetha', age: '1 / F', dept: 'NICU Ward', time: '08:10 AM', status: 'Admitted' },
    { id: 'gmch-adm-5', name: 'Sundaram Pillai', age: '71 / M', dept: 'Cardiology ICU', time: '07:15 AM', status: 'Admitted' },
  ],
  tasks: [
    { id: 'gmch-tsk-1', title: 'State Health Mission census upload', dept: 'Administration', priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'gmch-tsk-2', title: 'Casualty trauma triage clearances', dept: 'Emergency', priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'gmch-tsk-3', title: 'Blood bank platelets restock audit', dept: 'Blood Bank', priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'gmch-tsk-4', title: 'Free drug dispensation quota sync', dept: 'Pharmacy', priority: 'Low', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ],
  alerts: [
    { id: 'gmch-alt-1', title: '4 Trauma victims arriving via 108 Ambulance', sub: 'Casualty • 3 min ago', type: 'emergency' },
    { id: 'gmch-alt-2', title: 'Liquid Oxygen Primary Plant pressure check', sub: 'Biomedical • 15 min ago', type: 'biomedical' },
    { id: 'gmch-alt-3', title: 'Anti-rabies & Anti-venom stock reorder needed', sub: 'Pharmacy • 28 min ago', type: 'pharmacy' },
    { id: 'gmch-alt-4', title: 'Biochemistry Analyzer 3 calibration cycle', sub: 'Laboratory • 40 min ago', type: 'lab' },
  ],
};

// Seed dataset for City Care Hospital (HG-H001)
const CITYCARE_SEED: HospitalUserspaceData = {
  hospitalCode: 'HG-H001',
  hospitalName: 'City Care Hospital',
  metrics: {
    todayOpd: 148,
    ipdPatients: 86,
    totalBeds: 120,
    availableBeds: 24,
    occupancyPercentage: 80,
    labOrdersTotal: 32,
    labOrdersPending: 12,
    labOrdersCompleted: 20,
    pharmacyAlerts: 5,
    todayRevenue: '₹ 2,48,320',
    revenueVsYesterday: '↑ 8% vs yesterday',
    revenueBreakdown: [
      { label: 'OPD Consultations', amount: '₹ 1,12,480', dot: 'bg-blue-600' },
      { label: 'IPD Admissions & Wards', amount: '₹ 86,200', dot: 'bg-teal-500' },
      { label: 'Pharmacy Dispensary', amount: '₹ 32,400', dot: 'bg-amber-500' },
      { label: 'Laboratory Diagnostics', amount: '₹ 12,600', dot: 'bg-purple-500' },
      { label: 'Radiology & Imaging', amount: '₹ 4,640', dot: 'bg-indigo-500' },
    ],
  },
  appointments: [
    {
      id: 'cc-apt-1',
      time: '09:00 AM',
      name: 'Priya Sharma',
      dept: 'OPD - General Medicine',
      doctor: 'Dr. Arjun Mehta',
      status: 'Checked In',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'cc-apt-2',
      time: '09:30 AM',
      name: 'Karthik R',
      dept: 'OPD - Cardiology',
      doctor: 'Dr. Sneha Iyer',
      status: 'Waiting',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'cc-apt-3',
      time: '10:00 AM',
      name: 'Meena Devi',
      dept: 'OPD - Endocrinology',
      doctor: 'Dr. Vikram Nair',
      status: 'Waiting',
      statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'cc-apt-4',
      time: '10:30 AM',
      name: 'Rajesh Kumar',
      dept: 'OPD - Orthopedics',
      doctor: 'Dr. Priya Menon',
      status: 'Scheduled',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'cc-apt-5',
      time: '11:00 AM',
      name: 'Lakshmi S',
      dept: 'OPD - Dermatology',
      doctor: 'Dr. Amit Desai',
      status: 'Scheduled',
      statusColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ],
  admissions: [
    { id: 'cc-adm-1', name: 'Suresh Rajan', age: '45 / M', dept: 'General Medicine', time: '10:20 AM', status: 'Admitted' },
    { id: 'cc-adm-2', name: 'Anita Sharma', age: '32 / F', dept: 'Gynecology', time: '09:15 AM', status: 'Admitted' },
    { id: 'cc-adm-3', name: 'Rahul Verma', age: '28 / M', dept: 'Orthopedics', time: '08:40 AM', status: 'In OT' },
    { id: 'cc-adm-4', name: 'Meena Devi', age: '56 / F', dept: 'Cardiology', time: '07:50 AM', status: 'Admitted' },
    { id: 'cc-adm-5', name: 'Karthik S', age: '12 / M', dept: 'Pediatrics', time: '07:30 AM', status: 'Admitted' },
  ],
  tasks: [
    { id: 'cc-tsk-1', title: 'Lab reports awaiting verification', dept: 'Laboratory', priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'cc-tsk-2', title: 'Discharge summaries pending', dept: 'Inpatient', priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'cc-tsk-3', title: 'Medicine requisitions pending approval', dept: 'Pharmacy', priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'cc-tsk-4', title: 'Insurance claims to review', dept: 'Finance', priority: 'Low', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ],
  alerts: [
    { id: 'cc-alt-1', title: '2 patients in Emergency waiting', sub: 'Emergency • 5 min ago', type: 'emergency' },
    { id: 'cc-alt-2', title: 'Ventilator V-03 requires maintenance', sub: 'Biomedical • 18 min ago', type: 'biomedical' },
    { id: 'cc-alt-3', title: 'Paracetamol 500mg out of stock', sub: 'Pharmacy • 25 min ago', type: 'pharmacy' },
    { id: 'cc-alt-4', title: 'Lab Analyzer L-02 offline', sub: 'Laboratory • 42 min ago', type: 'lab' },
  ],
};

export const createDefaultUserspace = (hospitalCode: string, hospitalName: string, totalBeds = 100, availableBeds = 25): HospitalUserspaceData => {
  const code = hospitalCode.toUpperCase();
  if (code === 'HG-H002') return JSON.parse(JSON.stringify(GMCH_SEED));
  if (code === 'HG-H001') return JSON.parse(JSON.stringify(CITYCARE_SEED));

  return {
    hospitalCode,
    hospitalName,
    metrics: {
      todayOpd: 42,
      ipdPatients: totalBeds - availableBeds,
      totalBeds,
      availableBeds,
      occupancyPercentage: Math.round(((totalBeds - availableBeds) / Math.max(totalBeds, 1)) * 100),
      labOrdersTotal: 15,
      labOrdersPending: 4,
      labOrdersCompleted: 11,
      pharmacyAlerts: 1,
      todayRevenue: '₹ 84,500',
      revenueVsYesterday: '↑ 5% vs yesterday',
      revenueBreakdown: [
        { label: 'OPD Consultations', amount: '₹ 45,000', dot: 'bg-blue-600' },
        { label: 'IPD Ward Care', amount: '₹ 28,000', dot: 'bg-teal-500' },
        { label: 'Pharmacy Dispensary', amount: '₹ 7,500', dot: 'bg-amber-500' },
        { label: 'Diagnostics & Lab', amount: '₹ 4,000', dot: 'bg-purple-500' },
      ],
    },
    appointments: [
      {
        id: `apt-${Date.now()}-1`,
        time: '10:00 AM',
        name: 'Initial Facility Patient',
        dept: 'OPD - General Medicine',
        doctor: 'Duty Medical Officer',
        status: 'Confirmed',
        statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
    ],
    admissions: [
      {
        id: `adm-${Date.now()}-1`,
        name: 'General Inpatient',
        age: '40 / M',
        dept: 'General Ward',
        time: '09:00 AM',
        status: 'Admitted',
      },
    ],
    tasks: [
      { id: `tsk-1`, title: 'Facility accreditation sync', dept: 'Admin', priority: 'High', color: 'text-rose-600 bg-rose-50 border-rose-200' },
      { id: `tsk-2`, title: 'Staff shift roster confirmation', dept: 'Nursing', priority: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    ],
    alerts: [
      { id: `alt-1`, title: 'New Facility Userspace Initialized', sub: 'System • Just now', type: 'biomedical' },
    ],
  };
};

export const getHospitalUserspace = (
  hospitalCode: string,
  hospitalName = 'Hospital Facility',
  totalBeds = 100,
  availableBeds = 25
): HospitalUserspaceData => {
  const key = `${STORAGE_PREFIX}${hospitalCode.toUpperCase()}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.hospitalCode) {
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

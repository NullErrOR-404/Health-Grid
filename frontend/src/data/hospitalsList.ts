export interface HospitalEntity {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  type: string;
  totalBeds: number;
  availableBeds: number;
  adminName: string;
  adminEmail: string;
  username?: string;
  password?: string;
}

export const INITIAL_HOSPITALS: HospitalEntity[] = [
  {
    id: 'hosp-1',
    code: 'HG-H001',
    name: 'City Care Hospital',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'Multi-Specialty Tertiary Hospital',
    totalBeds: 120,
    availableBeds: 24,
    adminName: 'Admin Ravi',
    adminEmail: 'ravi.admin@citycare.in',
    username: 'ravi_admin',
    password: 'CityCare#2026',
  },
  {
    id: 'hosp-2',
    code: 'HG-H002',
    name: 'Govt Medical College & Hospital',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'Government Medical College & Tertiary Care',
    totalBeds: 450,
    availableBeds: 68,
    adminName: 'Dr. K. Srinivasan',
    adminEmail: 'dean@gmchchennai.gov.in',
    username: 'gmch_admin',
    password: 'GMCH#Hospital2026',
  },
  {
    id: 'hosp-3',
    code: 'HG-H003',
    name: 'Apollo Specialty Hospital',
    city: 'Greams Road, Chennai',
    state: 'Tamil Nadu',
    type: 'Super Specialty Hospital',
    totalBeds: 280,
    availableBeds: 42,
    adminName: 'Sanjay Mukherjee',
    adminEmail: 'admin@apollo.in',
    username: 'apollo_admin',
    password: 'Apollo#2026',
  },
  {
    id: 'hosp-4',
    code: 'HG-H004',
    name: 'Fortis Malar Hospital',
    city: 'Adyar, Chennai',
    state: 'Tamil Nadu',
    type: 'Multi-Specialty Hospital',
    totalBeds: 180,
    availableBeds: 31,
    adminName: 'Radha Venkat',
    adminEmail: 'admin@fortismalar.in',
    username: 'fortis_admin',
    password: 'Fortis#2026',
  },
  {
    id: 'hosp-5',
    code: 'HG-H005',
    name: 'Kaveri Hospital',
    city: 'Alwarpet, Chennai',
    state: 'Tamil Nadu',
    type: 'Multi-Specialty Care Center',
    totalBeds: 200,
    availableBeds: 35,
    adminName: 'Venkatesh Babu',
    adminEmail: 'admin@kaverihealth.com',
    username: 'kaveri_admin',
    password: 'Kaveri#2026',
  },
];

const STORAGE_KEY = 'healthgrid_registered_hospitals';

export const getHospitalsList = (): HospitalEntity[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with initial hospitals to guarantee credentials and new fields
        const mergedMap = new Map<string, HospitalEntity>();
        INITIAL_HOSPITALS.forEach((h) => mergedMap.set(h.code, h));
        parsed.forEach((h: HospitalEntity) => {
          const existing = mergedMap.get(h.code);
          mergedMap.set(h.code, { ...existing, ...h });
        });
        return Array.from(mergedMap.values());
      }
    }
  } catch (e) {
    console.warn('Error reading stored hospitals', e);
  }
  return INITIAL_HOSPITALS;
};

export const saveHospital = (newHospital: HospitalEntity): HospitalEntity[] => {
  const current = getHospitalsList();
  const updated = [newHospital, ...current.filter((h) => h.id !== newHospital.id && h.code !== newHospital.code)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error storing hospital', e);
  }
  return updated;
};

export const validateHospitalCredentials = (
  hospitalCode: string,
  identifier: string,
  pass: string
): { valid: boolean; hospital?: HospitalEntity; message?: string } => {
  const allHospitals = getHospitalsList();
  const targetHospital = allHospitals.find(
    (h) => h.code.toUpperCase() === hospitalCode.toUpperCase() || h.id === hospitalCode
  );

  if (!targetHospital) {
    return { valid: false, message: 'Hospital facility not found in network directory.' };
  }

  const cleanInput = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();

  const isUsernameMatch = targetHospital.username && targetHospital.username.toLowerCase() === cleanInput;
  const isEmailMatch = targetHospital.adminEmail && targetHospital.adminEmail.toLowerCase() === cleanInput;

  if (!isUsernameMatch && !isEmailMatch) {
    return {
      valid: false,
      message: `Invalid username or email for ${targetHospital.name}. Please enter authorized administrator credentials.`,
    };
  }

  if (targetHospital.password && targetHospital.password !== cleanPass) {
    return {
      valid: false,
      message: `Incorrect password for ${targetHospital.name}. Please verify your password.`,
    };
  }

  return { valid: true, hospital: targetHospital };
};

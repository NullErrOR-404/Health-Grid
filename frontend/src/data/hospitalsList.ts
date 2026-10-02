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
  },
];

const STORAGE_KEY = 'healthgrid_registered_hospitals';

export const getHospitalsList = (): HospitalEntity[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored hospitals', e);
  }
  return INITIAL_HOSPITALS;
};

export const saveHospital = (newHospital: HospitalEntity): HospitalEntity[] => {
  const current = getHospitalsList();
  const updated = [newHospital, ...current.filter((h) => h.id !== newHospital.id)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error storing hospital', e);
  }
  return updated;
};

/**
 * HealthGrid DocBot Natural Language Booking & Clinical Extraction Engine
 * 
 * Extracts structured appointment parameters (Doctor, Department, Hospital,
 * Date Offset, Time Slot, and Chief Complaint) directly from conversational text in
 * English, Tamil, and Tanglish.
 */

import { doctorOpdService, type DoctorRecord } from './doctorOpdService';
import { INITIAL_HOSPITALS } from '../data/hospitalsList';

export interface ExtractedBookingIntent {
  hasBookingIntent: boolean;
  hasRescheduleIntent: boolean;
  hasCancelIntent: boolean;
  doctor?: DoctorRecord;
  doctorName?: string;
  department?: string;
  hospitalId?: string;
  hospitalName?: string;
  preferredDate?: string; // YYYY-MM-DD
  timeSlot?: 'Morning' | 'Afternoon' | 'Evening';
  exactSlot?: string; // e.g. '09:00 AM'
  condition?: string;
  patientType?: 'myself' | 'family';
  beneficiaryName?: string;
}

export class NlpBookingParser {
  private static DEPARTMENTS = [
    {
      name: 'General Medicine',
      keywords: ['fever', 'cold', 'cough', 'flu', 'headache', 'weakness', 'fatigue', 'general', 'infection', 'காய்ச்சல்', 'சளி', 'பொது மருத்துவம்', 'உடல் சோர்வு'],
    },
    {
      name: 'Cardiology',
      keywords: ['heart', 'cardio', 'chest pain', 'bp', 'blood pressure', 'palpitations', 'hypertension', 'மார்பு வலி', 'இதயம்', 'இரத்த அழுத்தம்'],
    },
    {
      name: 'Orthopaedics',
      keywords: ['bone', 'joint', 'fracture', 'ortho', 'knee', 'back pain', 'spine', 'shoulder', 'மூட்டு', 'எலும்பு', 'முழங்கால் வலி', 'முதுகு வலி'],
    },
    {
      name: 'Dermatology',
      keywords: ['skin', 'rash', 'derma', 'itching', 'allergy', 'pimples', 'acne', 'eczema', 'தோல்', 'அரிப்பு', 'தடிப்பு'],
    },
    {
      name: 'Pediatrics',
      keywords: ['child', 'pediatric', 'baby', 'kid', 'infant', 'toddler', 'குழந்தை', 'சிறுவர்'],
    },
    {
      name: 'ENT & Otorhinolaryngology',
      keywords: ['ent', 'ear', 'nose', 'throat', 'tonsil', 'hearing', 'sinus', 'காது', 'மூக்கு', 'தொண்டை'],
    },
    {
      name: 'Neurology',
      keywords: ['neuro', 'nerve', 'migraine', 'dizziness', 'paralysis', 'seizure', 'நரம்பு', 'ஒற்றைத் தலைவலி'],
    },
    {
      name: 'Gynecology & Obstetrics',
      keywords: ['gyn', 'gynecology', 'pregnancy', 'period', 'maternity', 'மாதவிடாய்', 'கர்ப்பம்'],
    },
    {
      name: 'Pulmonology',
      keywords: ['lung', 'asthma', 'breath', 'wheezing', 'inhaler', 'மூச்சு', 'ஆஸ்துமா'],
    },
  ];

  public static parse(query: string): ExtractedBookingIntent {
    const raw = query.trim();
    const lower = raw.toLowerCase();

    // 1. Intent Flags
    const isBooking =
      lower.includes('book') ||
      lower.includes('appointment') ||
      lower.includes('consult') ||
      lower.includes('see a doctor') ||
      lower.includes('doctor slot') ||
      lower.includes('முன்பதிவு') ||
      lower.includes('சந்திப்பு') ||
      lower.includes('நேரம் ஒதுக்கு');

    const isReschedule =
      lower.includes('reschedule') ||
      lower.includes('change time') ||
      lower.includes('change date') ||
      lower.includes('postpone') ||
      lower.includes('shift appointment') ||
      lower.includes('நேரத்தை மாற்று') ||
      lower.includes('தேதியை மாற்று') ||
      lower.includes('மாற்றவும்');

    const isCancel =
      lower.includes('cancel') ||
      lower.includes('dont want') ||
      lower.includes("don't want") ||
      lower.includes('delete appointment') ||
      lower.includes('drop booking') ||
      lower.includes('ரத்து செய்') ||
      lower.includes('ரத்து');

    // 2. Doctor Extraction
    const allDoctors = doctorOpdService.getDoctors();
    let matchedDoctor: DoctorRecord | undefined = undefined;
    let doctorName: string | undefined = undefined;

    for (const doc of allDoctors) {
      const docFirstName = doc.name.replace(/^Dr\.\s*/i, '').trim().toLowerCase();
      if (lower.includes(docFirstName) || lower.includes(doc.name.toLowerCase())) {
        matchedDoctor = doc;
        doctorName = doc.name;
        break;
      }
    }

    // 3. Department Extraction
    let matchedDept: string | undefined = matchedDoctor?.department;
    if (!matchedDept) {
      for (const dept of this.DEPARTMENTS) {
        if (dept.keywords.some((k) => lower.includes(k))) {
          matchedDept = dept.name;
          break;
        }
      }
    }

    // 4. Hospital Extraction
    let hospitalId = 'HG-H002';
    let hospitalName = 'Govt Medical College & Hospital (GMCH)';
    for (const hosp of INITIAL_HOSPITALS) {
      const hospKeywords = [hosp.code.toLowerCase(), hosp.name.toLowerCase(), hosp.city.toLowerCase()];
      if (hospKeywords.some((k) => lower.includes(k))) {
        hospitalId = hosp.code;
        hospitalName = hosp.name;
        break;
      }
    }

    // 5. Date Extraction
    let preferredDate: string | undefined = undefined;
    const now = new Date();

    if (lower.includes('today') || lower.includes('இன்று')) {
      preferredDate = now.toISOString().slice(0, 10);
    } else if (lower.includes('tomorrow') || lower.includes('நாளை')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      preferredDate = tomorrow.toISOString().slice(0, 10);
    } else if (lower.includes('day after tomorrow') || lower.includes('நாளை மறுநாள்')) {
      const dayAfter = new Date(now);
      dayAfter.setDate(dayAfter.getDate() + 2);
      preferredDate = dayAfter.toISOString().slice(0, 10);
    } else {
      const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < weekdays.length; i++) {
        if (lower.includes(weekdays[i])) {
          const targetDay = i;
          const currentDay = now.getDay();
          let daysToAdd = (targetDay - currentDay + 7) % 7;
          if (daysToAdd === 0) daysToAdd = 7; // next week's day
          const targetDate = new Date(now);
          targetDate.setDate(targetDate.getDate() + daysToAdd);
          preferredDate = targetDate.toISOString().slice(0, 10);
          break;
        }
      }
    }

    if (!preferredDate) {
      // Default to today or tomorrow if booking intent
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      preferredDate = tomorrow.toISOString().slice(0, 10);
    }

    // 6. Time Slot Extraction
    let timeSlot: 'Morning' | 'Afternoon' | 'Evening' = 'Morning';
    let exactSlot: string | undefined = undefined;

    if (lower.includes('afternoon') || lower.includes('மதியம்') || lower.includes('noon')) {
      timeSlot = 'Afternoon';
      exactSlot = '12:30 PM';
    } else if (lower.includes('evening') || lower.includes('மாலை') || lower.includes('night')) {
      timeSlot = 'Evening';
      exactSlot = '04:30 PM';
    } else if (lower.includes('morning') || lower.includes('காலை')) {
      timeSlot = 'Morning';
      exactSlot = '09:00 AM';
    }

    // Detect explicit time tokens like '10 am', '09:30', '10:00 am', '2 pm'
    const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
    const timeMatch = lower.match(timeRegex);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] || '00';
      const meridian = timeMatch[3].toUpperCase();
      exactSlot = `${String(hour).padStart(2, '0')}:${minutes} ${meridian}`;
      if (meridian === 'AM' && hour < 12) {
        timeSlot = 'Morning';
      } else if (meridian === 'PM' && (hour === 12 || hour <= 4)) {
        timeSlot = 'Afternoon';
      } else {
        timeSlot = 'Evening';
      }
    }

    // 7. Chief Complaint / Condition Extraction
    let condition = '';
    const cleanQuery = raw
      .replace(/^(can\s+you\s+)?(please\s+)?(i\s+want\s+to\s+)?(book|schedule|reschedule|cancel)\s+(an\s+)?appointment\s+(with\s+dr\.?\s+[a-z]+)?/i, '')
      .replace(/(for|because\s+of|due\s+to)\s+/i, '')
      .replace(/(on|tomorrow|today|morning|afternoon|evening|next\s+week).*/i, '')
      .trim();

    if (cleanQuery.length > 3 && !cleanQuery.toLowerCase().includes('appointment')) {
      condition = cleanQuery;
    } else {
      // Find symptom keyword matches
      for (const dept of this.DEPARTMENTS) {
        const foundKey = dept.keywords.find((k) => lower.includes(k));
        if (foundKey) {
          condition = foundKey.charAt(0).toUpperCase() + foundKey.slice(1) + ' consultation';
          break;
        }
      }
    }

    // 8. Patient Type
    const isFamily =
      lower.includes('family') ||
      lower.includes('mother') ||
      lower.includes('father') ||
      lower.includes('child') ||
      lower.includes('son') ||
      lower.includes('daughter') ||
      lower.includes('wife') ||
      lower.includes('husband') ||
      lower.includes('அம்மா') ||
      lower.includes('அப்பா') ||
      lower.includes('மனைவி');

    return {
      hasBookingIntent: isBooking,
      hasRescheduleIntent: isReschedule,
      hasCancelIntent: isCancel,
      doctor: matchedDoctor,
      doctorName: doctorName || matchedDoctor?.name,
      department: matchedDept || 'General Medicine',
      hospitalId,
      hospitalName,
      preferredDate,
      timeSlot,
      exactSlot,
      condition: condition || (isBooking ? 'General Outpatient Consultation' : undefined),
      patientType: isFamily ? 'family' : 'myself',
    };
  }
}

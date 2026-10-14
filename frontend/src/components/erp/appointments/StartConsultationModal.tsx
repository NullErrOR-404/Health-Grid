import React from 'react';
import { type Appointment } from '../../../services/appointmentService';
import { ClinicalConsultationModal } from '../modals/ClinicalConsultationModal';

interface StartConsultationModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onNavigateToOpd?: (patientId: string) => void;
}

export const StartConsultationModal: React.FC<StartConsultationModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onSuccess,
  onNavigateToOpd,
}) => {
  if (!isOpen || !appointment) return null;

  return (
    <ClinicalConsultationModal
      isOpen={isOpen}
      onClose={onClose}
      appointmentId={appointment.id || appointment.appointment_id}
      patientId={appointment.patient_id}
      patientName={appointment.patient_name}
      patientHealthId={appointment.patient_health_id}
      department={appointment.department}
      doctorName={appointment.doctor_name || 'Dr. Mohamed'}
      initialStatus={appointment.status}
      chiefComplaint={appointment.reason_for_visit}
      onSuccess={onSuccess}
      onCompleted={() => {
        if (appointment.patient_id && onNavigateToOpd) {
          onNavigateToOpd(appointment.patient_id);
        }
      }}
    />
  );
};

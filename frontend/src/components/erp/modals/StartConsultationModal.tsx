import React from 'react';
import { unifiedPatientStore } from '../../../services/unifiedPatientStore';
import { appointmentService } from '../../../services/appointmentService';
import { ClinicalConsultationModal } from './ClinicalConsultationModal';

interface StartConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  department: string;
  token?: number;
  onCompleted?: () => void;
}

export const StartConsultationModal: React.FC<StartConsultationModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  department,
  token,
  onCompleted,
}) => {
  if (!isOpen) return null;

  const patient = unifiedPatientStore.getPatientById(patientId);
  const patientHealthId = patient?.healthId || '';
  
  // Look up matching appointment if exists
  const allAppts = appointmentService.getAppointments();
  const matchingAppt = allAppts.find(
    (a) =>
      a.patient_id === patientId ||
      a.patient_health_id?.toLowerCase() === patientHealthId.toLowerCase()
  );

  return (
    <ClinicalConsultationModal
      isOpen={isOpen}
      onClose={onClose}
      appointmentId={matchingAppt?.id || matchingAppt?.appointment_id}
      patientId={patientId}
      patientName={patientName}
      patientHealthId={patientHealthId}
      department={department}
      doctorName={matchingAppt?.doctor_name || 'Dr. Mohamed'}
      token={token}
      initialStatus={matchingAppt?.status || (token ? 'Waiting' : 'Scheduled')}
      chiefComplaint={matchingAppt?.reason_for_visit || 'Outpatient clinical consultation'}
      onCompleted={onCompleted}
    />
  );
};

import React, { useState, useEffect } from 'react';
import { ClinicianSidebar } from './ClinicianSidebar';
import { ClinicianTopBar } from './ClinicianTopBar';
import { ClinicianAiDrawer } from './ClinicianAiDrawer';
import { MyQueueView } from './queue/MyQueueView';
import { ClinicianAppointmentsView } from './appointments/ClinicianAppointmentsView';
import { PatientsDirectoryView } from './patients/PatientsDirectoryView';
import { PatientChartWorkspace } from './chart/PatientChartWorkspace';
import { ConsultationsLandingView } from './consultations/ConsultationsLandingView';
import { ClinicalEncounterWorkspace } from './encounter/ClinicalEncounterWorkspace';
import { FollowUpsWorkspaceView } from './followups/FollowUpsWorkspaceView';
import { ReferralsWorkspaceView } from './referrals/ReferralsWorkspaceView';
import { ClinicalInboxView } from './inbox/ClinicalInboxView';
import { ClinicianMessagesView } from './communication/ClinicianMessagesView';
import { ClinicalToolsViews } from './tools/ClinicalToolsViews';
import { clinicianStore } from '../../services/clinician/clinicianWorkflowStore';
import type { ClinicianPortalTab } from '../../types/clinician';

interface ClinicianPortalLayoutProps {
  onExitPortal?: () => void;
}

export const ClinicianPortalLayout: React.FC<ClinicianPortalLayoutProps> = ({ onExitPortal }) => {
  const [storeState, setStoreState] = useState(clinicianStore.getState());
  const [chartPatientId, setChartPatientId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = clinicianStore.subscribe(() => {
      setStoreState({ ...clinicianStore.getState() });
    });
    return unsub;
  }, []);

  const handleSelectTab = (tab: ClinicianPortalTab) => {
    if (tab !== 'patients') {
      setChartPatientId(null);
    }
    clinicianStore.setActiveTab(tab);
  };

  const handleOpenPatientChart = (patientId: string) => {
    setChartPatientId(patientId);
    clinicianStore.openChartForPatient(patientId);
  };

  const handleStartConsultation = (patientId: string) => {
    clinicianStore.startConsultation(patientId);
  };

  const handleOpenEncounter = (encounterId: string) => {
    clinicianStore.updateEncounter(encounterId, {});
    clinicianStore.getState().activeEncounterId = encounterId;
    clinicianStore.setActiveTab('consultations');
  };

  const renderActiveView = () => {
    const { activeTab, activeEncounterId } = storeState;

    switch (activeTab) {
      case 'my-queue':
        return (
          <MyQueueView
            onOpenPatientChart={handleOpenPatientChart}
            onStartConsultation={handleStartConsultation}
          />
        );

      case 'appointments':
        return (
          <ClinicianAppointmentsView
            onOpenPatientChart={handleOpenPatientChart}
            onStartConsultation={handleStartConsultation}
          />
        );

      case 'patients':
        if (chartPatientId) {
          return (
            <PatientChartWorkspace
              patientId={chartPatientId}
              onBack={() => setChartPatientId(null)}
              onStartConsultation={handleStartConsultation}
            />
          );
        }
        return (
          <PatientsDirectoryView
            onOpenPatientChart={handleOpenPatientChart}
            onStartConsultation={handleStartConsultation}
          />
        );

      case 'consultations':
        if (activeEncounterId) {
          return (
            <ClinicalEncounterWorkspace
              encounterId={activeEncounterId}
              onExit={() => {
                clinicianStore.getState().activeEncounterId = null;
                clinicianStore.setActiveTab('consultations');
              }}
            />
          );
        }
        return (
          <ConsultationsLandingView
            onOpenEncounter={handleOpenEncounter}
            onOpenPatientChart={handleOpenPatientChart}
          />
        );

      case 'follow-ups':
        return (
          <FollowUpsWorkspaceView
            onOpenPatientChart={handleOpenPatientChart}
            onStartConsultation={handleStartConsultation}
          />
        );

      case 'referrals':
        return (
          <ReferralsWorkspaceView
            onOpenPatientChart={handleOpenPatientChart}
          />
        );

      case 'inbox':
        return (
          <ClinicalInboxView
            onOpenPatientChart={handleOpenPatientChart}
          />
        );

      case 'messages':
        return (
          <ClinicianMessagesView
            onOpenPatientChart={handleOpenPatientChart}
          />
        );

      case 'templates':
      case 'order-sets':
      case 'guidelines':
      case 'settings':
      case 'help':
        return <ClinicalToolsViews toolType={activeTab} />;

      default:
        return (
          <MyQueueView
            onOpenPatientChart={handleOpenPatientChart}
            onStartConsultation={handleStartConsultation}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-row overflow-x-hidden">
      {/* 1. Global Left Sidebar */}
      <ClinicianSidebar
        activeTab={storeState.activeTab}
        onSelectTab={handleSelectTab}
        onExitPortal={onExitPortal}
      />

      {/* 2. Main Workstation Center Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navigation Bar */}
        <ClinicianTopBar
          aiDrawerOpen={storeState.aiDrawerOpen}
          onToggleAiDrawer={() => clinicianStore.setAiDrawerOpen(!storeState.aiDrawerOpen)}
          onOpenPatientChart={handleOpenPatientChart}
          onStartConsultation={handleStartConsultation}
        />

        {/* Dynamic Clinical Content Viewport */}
        <main className="p-4 sm:p-6 max-w-[1680px] w-full mx-auto flex-1">
          {renderActiveView()}
        </main>
      </div>

      {/* 3. Embedded HealthGrid AI Assistant Right Drawer */}
      <ClinicianAiDrawer
        isOpen={storeState.aiDrawerOpen}
        onClose={() => clinicianStore.setAiDrawerOpen(false)}
      />
    </div>
  );
};

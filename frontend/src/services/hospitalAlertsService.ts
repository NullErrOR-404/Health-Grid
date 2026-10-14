export interface HospitalAlert {
  id: string;
  type: 'REGISTRATION' | 'CHECK_IN' | 'EMERGENCY' | 'CONSULTATION';
  patientName: string;
  healthId: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
}

type AlertSubscriber = () => void;

const STORAGE_PREFIX = 'healthgrid_hospital_inbox_alerts_';

class HospitalAlertsService {
  private alerts: HospitalAlert[] = [];
  private subscribers: Set<AlertSubscriber> = new Set();
  private currentHospitalCode: string = 'HG-H002';

  constructor() {
    this.loadAlerts();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key?.startsWith(STORAGE_PREFIX)) {
          this.loadAlerts();
          this.notifySubscribers();
        }
      });
      window.addEventListener('healthgrid_hospital_alert', (e: any) => {
        if (e.detail) {
          this.addAlert(e.detail);
        }
      });
    }
  }

  public setHospitalCode(code: string): void {
    this.currentHospitalCode = code;
    this.loadAlerts();
    this.notifySubscribers();
  }

  private getStorageKey(): string {
    return `${STORAGE_PREFIX}${this.currentHospitalCode}`;
  }

  private loadAlerts(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(this.getStorageKey());
      if (raw) {
        this.alerts = JSON.parse(raw);
      } else {
        // Initial clean state with welcome announcement
        this.alerts = [
          {
            id: 'alt-init-1',
            type: 'CHECK_IN',
            patientName: 'Mohamed Sameen S',
            healthId: 'HG-PP27BNQ',
            message: 'Mohamed Sameen S (HG-PP27BNQ) verified via HealthGrid Sovereign Identity',
            time: '10:00 AM',
            timestamp: Date.now() - 3600000,
            read: true,
          },
        ];
      }
    } catch {
      this.alerts = [];
    }
  }

  private saveAlerts(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.alerts));
    } catch (e) {
      console.warn('Failed to save hospital alerts:', e);
    }
  }

  public getAlerts(): HospitalAlert[] {
    return [...this.alerts];
  }

  public getUnreadCount(): number {
    return this.alerts.filter((a) => !a.read).length;
  }

  public addAlert(data: {
    type?: 'REGISTRATION' | 'CHECK_IN' | 'EMERGENCY' | 'CONSULTATION';
    patientName: string;
    healthId: string;
    message: string;
  }): HospitalAlert {
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newAlert: HospitalAlert = {
      id: `alt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: data.type || 'REGISTRATION',
      patientName: data.patientName,
      healthId: data.healthId,
      message: data.message,
      time: timeStr,
      timestamp: Date.now(),
      read: false,
    };

    this.alerts.unshift(newAlert);
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }

    this.saveAlerts();
    this.notifySubscribers();

    // Also trigger native custom event for any listening UI components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('healthgrid_hospital_alert_received', {
          detail: newAlert,
        })
      );
    }

    return newAlert;
  }

  public markAsRead(id: string): void {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert && !alert.read) {
      alert.read = true;
      this.saveAlerts();
      this.notifySubscribers();
    }
  }

  public markAllAsRead(): void {
    let changed = false;
    this.alerts.forEach((a) => {
      if (!a.read) {
        a.read = true;
        changed = true;
      }
    });
    if (changed) {
      this.saveAlerts();
      this.notifySubscribers();
    }
  }

  public clearAll(): void {
    this.alerts = [];
    this.saveAlerts();
    this.notifySubscribers();
  }

  public subscribe(cb: AlertSubscriber): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error notifying hospital alert subscriber:', err);
      }
    });
  }
}

export const hospitalAlertsService = new HospitalAlertsService();

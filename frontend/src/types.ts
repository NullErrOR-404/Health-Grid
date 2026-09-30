export type Language = 'en' | 'ta';

export interface ActionCardItem {
  id: string;
  iconName: 'stethoscope' | 'ambulance' | 'fileText' | 'pill' | 'hospital' | 'baby';
  titleEn: string;
  titleTa: string;
  subtextEn: string;
  subtextTa: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  hoverBg: string;
}

import type { TaskType } from '@/types/analysis';
import { Colors } from './colors';

export interface TestConfigItem {
  icon: string;
  gradient: readonly [string, string];
  description: string;
  duration: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  ageRange: string;
  imageCount: number;
}

export const TEST_CONFIG: Record<TaskType, TestConfigItem> = {
  DAP: {
    icon: '\u{1F464}',
    gradient: ['#A78BFA', '#C4B5FD'],
    description: 'Kişi çizimi analizi',
    duration: '10-15 dk',
    difficulty: 'Kolay',
    ageRange: '5-12 yaş',
    imageCount: 1,
  },
  HTP: {
    icon: '\u{1F3E0}',
    gradient: ['#78C8E8', '#A3DBF0'],
    description: 'Ev-Ağaç-Kişi testi',
    duration: '20-30 dk',
    difficulty: 'Orta',
    ageRange: '5-12 yaş',
    imageCount: 3,
  },
  Family: {
    icon: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}',
    gradient: ['#FFB5D8', '#FFD6ED'],
    description: 'Aile çizimi testi',
    duration: '15-20 dk',
    difficulty: 'Orta',
    ageRange: '4-14 yaş',
    imageCount: 1,
  },
  Cactus: {
    icon: '\u{1F335}',
    gradient: ['#7ED99C', '#A8E8BA'],
    description: 'Kaktüs testi',
    duration: '10-15 dk',
    difficulty: 'Kolay',
    ageRange: '5-12 yaş',
    imageCount: 1,
  },
  Tree: {
    icon: '\u{1F333}',
    gradient: ['#68D89B', '#9EE7B7'],
    description: 'Ağaç testi',
    duration: '10-15 dk',
    difficulty: 'Kolay',
    ageRange: '5-14 yaş',
    imageCount: 1,
  },
  Garden: {
    icon: '\u{1F337}',
    gradient: ['#FF9B7A', '#FFB299'],
    description: 'Bahçe çizimi',
    duration: '15-20 dk',
    difficulty: 'Orta',
    ageRange: '5-12 yaş',
    imageCount: 1,
  },
  BenderGestalt2: {
    icon: '\u{1F537}',
    gradient: ['#4FB3D4', '#78C8E8'],
    description: 'Bender-Gestalt testi',
    duration: '20-30 dk',
    difficulty: 'Zor',
    ageRange: '5-11 yaş',
    imageCount: 1,
  },
  ReyOsterrieth: {
    icon: '\u{1F9E9}',
    gradient: [Colors.semantic.amber, '#FBBF24'],
    description: 'Rey karmaşık figür testi',
    duration: '15-20 dk',
    difficulty: 'Orta',
    ageRange: '4-14 yaş',
    imageCount: 1,
  },
  Aile: {
    icon: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}',
    gradient: ['#FFB5D8', '#FFD6ED'],
    description: 'Aile dinamikleri',
    duration: '15-20 dk',
    difficulty: 'Orta',
    ageRange: '4-14 yaş',
    imageCount: 1,
  },
  Kaktus: {
    icon: '\u{1F335}',
    gradient: ['#7ED99C', '#A8E8BA'],
    description: 'Savunma mekanizmaları',
    duration: '10-15 dk',
    difficulty: 'Kolay',
    ageRange: '5-12 yaş',
    imageCount: 1,
  },
  Agac: {
    icon: '\u{1F333}',
    gradient: ['#68D89B', '#9EE7B7'],
    description: 'Kişilik yapısı',
    duration: '10-15 dk',
    difficulty: 'Kolay',
    ageRange: '5-14 yaş',
    imageCount: 1,
  },
  Bahce: {
    icon: '\u{1F337}',
    gradient: ['#FF9B7A', '#FFB299'],
    description: 'İç dünya analizi',
    duration: '15-20 dk',
    difficulty: 'Orta',
    ageRange: '5-12 yaş',
    imageCount: 1,
  },
  Bender: {
    icon: '\u{1F537}',
    gradient: ['#4FB3D4', '#78C8E8'],
    description: 'Görsel-motor entegrasyon',
    duration: '20-30 dk',
    difficulty: 'Zor',
    ageRange: '5-11 yaş',
    imageCount: 1,
  },
  Rey: {
    icon: '\u{1F9E9}',
    gradient: [Colors.semantic.amber, '#FBBF24'],
    description: 'Görsel bellek testi',
    duration: '15-20 dk',
    difficulty: 'Orta',
    ageRange: '4-14 yaş',
    imageCount: 1,
  },
  Luscher: {
    icon: '\u{1F3A8}',
    gradient: ['#EC4899', '#F472B6'],
    description: 'Renk psikolojisi',
    duration: '5-10 dk',
    difficulty: 'Kolay',
    ageRange: '5-14 yaş',
    imageCount: 0,
  },
  FreeDrawing: {
    icon: '\u{2728}',
    gradient: ['#A78BFA', '#F472B6'],
    description: 'Serbest çizim analizi',
    duration: '20-40 sn',
    difficulty: 'Kolay',
    ageRange: '2-18 yaş',
    imageCount: 1,
  },
};

export const TASK_TYPES: TaskType[] = [
  'DAP',
  'HTP',
  'Aile',
  'Kaktus',
  'Agac',
  'Bahce',
  'Bender',
  'Rey',
  'Luscher',
];

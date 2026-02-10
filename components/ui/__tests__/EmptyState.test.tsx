/**
 * EmptyState Component Tests
 *
 * Tests for the EmptyState component used for empty content states
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../EmptyState';

// Mock Ioo component
jest.mock('@/components/Ioo', () => ({
  Ioo: () => null,
}));

// Mock RoleContext hooks
jest.mock('@/lib/contexts/RoleContext', () => ({
  useIsProfessional: () => false,
  useMascotSettings: () => ({
    showOnEmptyStates: false,
    prominence: 'hidden',
  }),
}));

// Mock haptics
jest.mock('@/lib/haptics', () => ({
  useHapticFeedback: () => ({
    tapMedium: jest.fn(),
  }),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    LinearGradient: (props: any) => <View {...props} />,
  };
});

describe('EmptyState', () => {
  describe('rendering by illustration type', () => {
    it('renders no-analysis illustration', () => {
      render(
        <EmptyState
          illustration="no-analysis"
          title="Henüz Analiz Yok"
          description="Çocuğunuzun bir çizimini yükleyerek duygusal analiz yapabilirsiniz."
        />
      );

      expect(screen.getByText('Henüz Analiz Yok')).toBeTruthy();
    });

    it('renders no-stories illustration', () => {
      render(
        <EmptyState
          illustration="no-stories"
          title="Henüz Hikaye Yok"
          description="İnteraktif hikayelerle çocuğunuzun hayal dünyasını keşfedin."
        />
      );

      expect(screen.getByText('Henüz Hikaye Yok')).toBeTruthy();
    });

    it('renders no-coloring illustration', () => {
      render(
        <EmptyState
          illustration="no-coloring"
          title="Henüz Boyama Yok"
          description="Boyama sayfaları ile yaratıcılığınızı ortaya koyun."
        />
      );

      expect(screen.getByText('Henüz Boyama Yok')).toBeTruthy();
    });

    it('renders no-history illustration', () => {
      render(
        <EmptyState
          illustration="no-history"
          title="Geçmiş Boş"
          description="Henüz bir aktivite yok. Keşfetmeye başlayın!"
        />
      );

      expect(screen.getByText('Geçmiş Boş')).toBeTruthy();
    });

    it('renders welcome illustration', () => {
      render(
        <EmptyState
          illustration="welcome"
          title="Hoş Geldin!"
          description="Çocuğunuzun duygusal dünyasını keşfetmeye hazır mısınız?"
        />
      );

      expect(screen.getByText('Hoş Geldin!')).toBeTruthy();
    });

    it('renders search-empty illustration', () => {
      render(
        <EmptyState
          illustration="search-empty"
          title="Sonuç Bulunamadı"
          description="Farklı bir şey aramayı dene."
        />
      );

      expect(screen.getByText('Sonuç Bulunamadı')).toBeTruthy();
    });

    it('renders error illustration', () => {
      render(
        <EmptyState
          illustration="error"
          title="Bir Hata Oluştu"
          description="Bir hata oluştu. Lütfen tekrar deneyin."
        />
      );

      expect(screen.getByText('Bir Hata Oluştu')).toBeTruthy();
    });

    it('renders no-children illustration', () => {
      render(
        <EmptyState
          illustration="no-children"
          title="Çocuk Profili Ekle"
          description="Çocuğunuzun profilini oluşturarak kişiselleştirilmiş deneyim elde edin."
        />
      );

      expect(screen.getByText('Çocuk Profili Ekle')).toBeTruthy();
    });

    it('renders no-badges illustration', () => {
      render(
        <EmptyState
          illustration="no-badges"
          title="Henüz Rozet Yok"
          description="Aktiviteleri tamamlayarak rozetler kazan."
        />
      );

      expect(screen.getByText('Henüz Rozet Yok')).toBeTruthy();
    });
  });

  describe('custom content', () => {
    it('renders custom title', () => {
      render(
        <EmptyState
          illustration="no-analysis"
          title="Custom Empty Title"
          description="Default description"
        />
      );

      expect(screen.getByText('Custom Empty Title')).toBeTruthy();
    });

    it('renders custom description', () => {
      render(
        <EmptyState
          illustration="no-analysis"
          title="Default Title"
          description="This is a custom description"
        />
      );

      expect(screen.getByText('This is a custom description')).toBeTruthy();
    });
  });

  describe('actions', () => {
    it('calls primary action on button press', () => {
      const onAction = jest.fn();
      render(
        <EmptyState
          illustration="no-analysis"
          title="Henüz Analiz Yok"
          description="Analiz yapın."
          actionLabel="Start Analysis"
          onAction={onAction}
        />
      );

      const actionButton = screen.getByText('Start Analysis');
      fireEvent.press(actionButton);

      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('calls secondary action on button press', () => {
      const onSecondaryAction = jest.fn();
      render(
        <EmptyState
          illustration="no-analysis"
          title="Henüz Analiz Yok"
          description="Analiz yapın."
          actionLabel="Start Analysis"
          onAction={() => {}}
          secondaryLabel="Learn More"
          onSecondaryAction={onSecondaryAction}
        />
      );

      const secondaryButton = screen.getByText('Learn More');
      fireEvent.press(secondaryButton);

      expect(onSecondaryAction).toHaveBeenCalledTimes(1);
    });

    it('does not show action button when onAction is not provided', () => {
      render(
        <EmptyState
          illustration="no-analysis"
          title="Henüz Analiz Yok"
          description="Analiz yapın."
          actionLabel="Start"
        />
      );

      // Button should not be rendered if onAction is not provided
      const button = screen.queryByText('Start');
      expect(button).toBeNull();
    });
  });

  describe('compact mode', () => {
    it('renders in compact mode', () => {
      render(
        <EmptyState
          illustration="no-analysis"
          title="Henüz Analiz Yok"
          description="Analiz yapın."
          compact
        />
      );

      expect(screen.getByText('Henüz Analiz Yok')).toBeTruthy();
    });
  });

  describe('custom styling', () => {
    it('accepts custom style prop', () => {
      render(
        <EmptyState
          illustration="no-analysis"
          title="Henüz Analiz Yok"
          description="Analiz yapın."
          style={{ marginTop: 20 }}
        />
      );

      expect(screen.getByText('Henüz Analiz Yok')).toBeTruthy();
    });
  });
});

describe('EmptyState presets', () => {
  it('NoAnalysisEmpty renders correctly', async () => {
    const { NoAnalysisEmpty } = await import('../EmptyState');
    render(<NoAnalysisEmpty />);

    expect(screen.getByText('Henüz Analiz Yok')).toBeTruthy();
  });

  it('NoStoriesEmpty renders correctly', async () => {
    const { NoStoriesEmpty } = await import('../EmptyState');
    render(<NoStoriesEmpty />);

    expect(screen.getByText('Hikaye Zamanı!')).toBeTruthy();
  });

  it('NoColoringEmpty renders correctly', async () => {
    const { NoColoringEmpty } = await import('../EmptyState');
    render(<NoColoringEmpty />);

    expect(screen.getByText('Renklere Hazır mısın?')).toBeTruthy();
  });
});

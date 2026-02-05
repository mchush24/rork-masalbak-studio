/**
 * ErrorState Component Tests
 *
 * Tests for the ErrorState component used for displaying errors
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorState } from '../ErrorState';

// Mock Ioo component
jest.mock('@/components/Ioo', () => ({
  Ioo: () => null,
}));

// Mock haptic feedback
jest.mock('@/lib/haptics', () => ({
  useHapticFeedback: () => ({
    error: jest.fn(),
    tap: jest.fn(),
  }),
}));

describe('ErrorState', () => {
  describe('rendering by type', () => {
    it('renders network error correctly', () => {
      render(<ErrorState type="network" />);

      expect(screen.getByText('İnternet Bağlantısı Yok')).toBeTruthy();
    });

    it('renders server error correctly', () => {
      render(<ErrorState type="server" />);

      expect(screen.getByText('Sunucuya Ulaşamadık')).toBeTruthy();
    });

    it('renders auth error correctly', () => {
      render(<ErrorState type="auth" />);

      expect(screen.getByText('Oturum Süresi Doldu')).toBeTruthy();
    });

    it('renders notfound error correctly', () => {
      render(<ErrorState type="notfound" />);

      expect(screen.getByText('Sayfa Bulunamadı')).toBeTruthy();
    });

    it('renders generic error correctly', () => {
      render(<ErrorState type="generic" />);

      expect(screen.getByText('Bir Şeyler Ters Gitti')).toBeTruthy();
    });

    it('renders timeout error correctly', () => {
      render(<ErrorState type="timeout" />);

      expect(screen.getByText('Bağlantı Zaman Aşımı')).toBeTruthy();
    });

    it('renders permission error correctly', () => {
      render(<ErrorState type="permission" />);

      expect(screen.getByText('Erişim İzni Gerekli')).toBeTruthy();
    });
  });

  describe('custom content', () => {
    it('renders custom title', () => {
      render(<ErrorState type="generic" title="Custom Error Title" />);

      expect(screen.getByText('Custom Error Title')).toBeTruthy();
    });

    it('renders custom description', () => {
      render(
        <ErrorState
          type="generic"
          description="This is a custom error description"
        />
      );

      expect(screen.getByText('This is a custom error description')).toBeTruthy();
    });

    it('renders both custom title and description', () => {
      render(
        <ErrorState
          type="generic"
          title="My Error"
          description="My Description"
        />
      );

      expect(screen.getByText('My Error')).toBeTruthy();
      expect(screen.getByText('My Description')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('calls onRetry when retry button is pressed', () => {
      const onRetry = jest.fn();
      render(<ErrorState type="network" onRetry={onRetry} />);

      const retryButton = screen.getByText('Tekrar Dene');
      fireEvent.press(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('calls onGoBack when back button is pressed', () => {
      const onGoBack = jest.fn();
      render(<ErrorState type="network" onGoBack={onGoBack} />);

      const backButton = screen.getByText('Geri Dön');
      fireEvent.press(backButton);

      expect(onGoBack).toHaveBeenCalledTimes(1);
    });

    it('does not show retry button when onRetry is not provided', () => {
      render(<ErrorState type="network" />);

      expect(screen.queryByText('Tekrar Dene')).toBeNull();
    });

    it('does not show back button when onGoBack is not provided', () => {
      render(<ErrorState type="network" />);

      expect(screen.queryByText('Geri Dön')).toBeNull();
    });
  });

  describe('support option', () => {
    it('shows support button when showSupport is true', () => {
      render(<ErrorState type="generic" showSupport />);

      expect(screen.getByText('Destek Al')).toBeTruthy();
    });

    it('does not show support button by default', () => {
      render(<ErrorState type="generic" />);

      expect(screen.queryByText('Destek Al')).toBeNull();
    });
  });

  describe('compact mode', () => {
    it('renders in compact mode', () => {
      render(<ErrorState type="network" compact />);

      expect(screen.getByText('İnternet Bağlantısı Yok')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('buttons are accessible', () => {
      const onRetry = jest.fn();
      render(<ErrorState type="network" onRetry={onRetry} />);

      const retryButton = screen.getByText('Tekrar Dene');
      expect(retryButton).toBeTruthy();
    });
  });
});

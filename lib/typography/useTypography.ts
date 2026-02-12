/**
 * useTypography Hook
 *
 * React hook for responsive typography with automatic
 * updates on screen dimension changes
 */

import { useEffect, useState, useCallback } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
  getCurrentBreakpoint,
  isTablet,
  isPhone,
  responsiveFontSizes,
  responsiveLineHeights,
  textStyles,
  Breakpoint,
  TextStyleName,
  FontSize,
} from './responsive';

interface TypographyState {
  breakpoint: Breakpoint;
  isTablet: boolean;
  isPhone: boolean;
  fontSizes: typeof responsiveFontSizes;
  lineHeights: typeof responsiveLineHeights;
  textStyles: typeof textStyles;
}

/**
 * Hook that provides responsive typography values
 * Automatically updates when screen dimensions change (e.g., rotation)
 *
 * @example
 * const { fontSizes, textStyles, isTablet } = useTypography();
 *
 * return (
 *   <Text style={[textStyles.headingLarge, { color: 'blue' }]}>
 *     Hello World
 *   </Text>
 * );
 */
export function useTypography(): TypographyState {
  const [state, setState] = useState<TypographyState>(() => ({
    breakpoint: getCurrentBreakpoint(),
    isTablet: isTablet(),
    isPhone: isPhone(),
    fontSizes: responsiveFontSizes,
    lineHeights: responsiveLineHeights,
    textStyles,
  }));

  const handleDimensionsChange = useCallback(
    ({ window: _window }: { window: ScaledSize; screen: ScaledSize }) => {
      setState({
        breakpoint: getCurrentBreakpoint(),
        isTablet: isTablet(),
        isPhone: isPhone(),
        fontSizes: responsiveFontSizes,
        lineHeights: responsiveLineHeights,
        textStyles,
      });
    },
    []
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
    return () => subscription.remove();
  }, [handleDimensionsChange]);

  return state;
}

/**
 * Hook for getting a specific text style
 *
 * @example
 * const headingStyle = useTextStyle('headingLarge');
 * return <Text style={headingStyle}>Title</Text>;
 */
export function useTextStyle(styleName: TextStyleName) {
  const { textStyles } = useTypography();
  return textStyles[styleName];
}

/**
 * Hook for getting a specific font size
 *
 * @example
 * const fontSize = useFontSize('lg');
 * return <Text style={{ fontSize }}>Large text</Text>;
 */
export function useFontSize(size: FontSize): number {
  const { fontSizes } = useTypography();
  return fontSizes[size];
}

/**
 * Hook for responsive conditional rendering
 *
 * @example
 * const { showTabletLayout, currentBreakpoint } = useResponsiveLayout();
 *
 * if (showTabletLayout) {
 *   return <TabletGrid />;
 * }
 * return <PhoneStack />;
 */
export function useResponsiveLayout() {
  const { breakpoint, isTablet: tablet, isPhone: phone } = useTypography();

  return {
    currentBreakpoint: breakpoint,
    showTabletLayout: tablet,
    showPhoneLayout: phone,
    isExtraSmall: breakpoint === 'xs',
    isSmall: breakpoint === 'sm',
    isMedium: breakpoint === 'md',
    isLarge: breakpoint === 'lg',
    isExtraLarge: breakpoint === 'xl' || breakpoint === 'xxl',
  };
}

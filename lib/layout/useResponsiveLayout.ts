/**
 * useResponsiveLayout Hook
 *
 * React hook for responsive layout with automatic updates
 * on screen dimension and orientation changes
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Dimensions, ScaledSize, ViewStyle } from 'react-native';
import { getCurrentBreakpoint, isTablet, isPhone, Breakpoint } from '../typography/responsive';
import {
  getScreenPadding,
  getGridGap,
  getColumns,
  getColumnWidth,
  getOrientation,
  isLandscape,
  isPortrait,
  containerStyles,
  ColumnCount,
  Orientation,
} from './responsive';

interface LayoutState {
  /** Current breakpoint (xs, sm, md, lg, xl, xxl) */
  breakpoint: Breakpoint;
  /** Screen width in pixels */
  screenWidth: number;
  /** Screen height in pixels */
  screenHeight: number;
  /** Current orientation */
  orientation: Orientation;
  /** Is device a tablet */
  isTablet: boolean;
  /** Is device a phone */
  isPhone: boolean;
  /** Is screen in landscape mode */
  isLandscape: boolean;
  /** Is screen in portrait mode */
  isPortrait: boolean;
  /** Current screen padding */
  padding: number;
  /** Current grid gap */
  gap: number;
  /** Default column count for current breakpoint */
  columns: ColumnCount;
}

/**
 * Hook that provides responsive layout values
 * Automatically updates when screen dimensions change
 *
 * @example
 * const { isTablet, columns, padding } = useLayout();
 *
 * return (
 *   <View style={{ padding, flexDirection: isTablet ? 'row' : 'column' }}>
 *     {items.map(item => (
 *       <View style={{ width: getColumnWidth(columns) }}>
 *         <ItemCard item={item} />
 *       </View>
 *     ))}
 *   </View>
 * );
 */
export function useLayout(): LayoutState {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  const handleDimensionsChange = useCallback(
    ({ window }: { window: ScaledSize; screen: ScaledSize }) => {
      setDimensions(window);
    },
    []
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);
    return () => subscription.remove();
  }, [handleDimensionsChange]);

  return useMemo(
    () => ({
      breakpoint: getCurrentBreakpoint(),
      screenWidth: dimensions.width,
      screenHeight: dimensions.height,
      orientation: getOrientation(),
      isTablet: isTablet(),
      isPhone: isPhone(),
      isLandscape: isLandscape(),
      isPortrait: isPortrait(),
      padding: getScreenPadding(),
      gap: getGridGap(),
      columns: getColumns(),
    }),
    [dimensions]
  );
}

interface GridLayoutOptions {
  /** Number of columns (or responsive config) */
  columns?: ColumnCount | Partial<Record<Breakpoint, ColumnCount>>;
  /** Gap between items */
  gap?: number;
  /** Horizontal padding */
  padding?: number;
}

interface GridLayoutResult {
  /** Style for grid container */
  containerStyle: ViewStyle;
  /** Width for each grid item */
  itemWidth: number;
  /** Effective number of columns */
  columnCount: ColumnCount;
}

/**
 * Hook for grid layout calculations
 *
 * @example
 * const { containerStyle, itemWidth, columnCount } = useGridLayout({
 *   columns: { xs: 1, sm: 2, lg: 3 },
 * });
 *
 * return (
 *   <View style={containerStyle}>
 *     {items.map(item => (
 *       <View key={item.id} style={{ width: itemWidth }}>
 *         <Card item={item} />
 *       </View>
 *     ))}
 *   </View>
 * );
 */
export function useGridLayout(options: GridLayoutOptions = {}): GridLayoutResult {
  const layout = useLayout();

  return useMemo(() => {
    const columnCount =
      typeof options.columns === 'number'
        ? options.columns
        : getColumns(options.columns);

    const gap = options.gap ?? layout.gap;
    const padding = options.padding ?? layout.padding;
    const itemWidth = getColumnWidth(columnCount, gap, padding);

    return {
      containerStyle: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap,
        paddingHorizontal: padding,
      },
      itemWidth,
      columnCount,
    };
  }, [layout, options]);
}

type ContainerType = 'screen' | 'centered' | 'narrow' | 'grid';

/**
 * Hook for getting container styles
 *
 * @example
 * const style = useContainerStyle('centered');
 * return <View style={style}>{children}</View>;
 */
export function useContainerStyle(type: ContainerType): ViewStyle {
  const layout = useLayout();

  return useMemo(() => {
    // Re-calculate based on current dimensions
    const padding = layout.padding;

    switch (type) {
      case 'screen':
        return {
          flex: 1,
          paddingHorizontal: padding,
        };
      case 'centered':
        return {
          flex: 1,
          paddingHorizontal: padding,
          ...(layout.isTablet && {
            maxWidth: 1200,
            alignSelf: 'center',
            width: '100%',
          }),
        };
      case 'narrow':
        return {
          flex: 1,
          paddingHorizontal: padding,
          ...(layout.isTablet && {
            maxWidth: 600,
            alignSelf: 'center',
            width: '100%',
          }),
        };
      case 'grid':
        return {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: layout.gap,
          paddingHorizontal: padding,
        };
      default:
        return containerStyles.screen;
    }
  }, [layout, type]);
}

/**
 * Hook for responsive conditional values
 *
 * @example
 * const numColumns = useResponsiveValue({ xs: 1, md: 2, lg: 3 }, 2);
 * const showSidebar = useResponsiveValue({ lg: true }, false);
 */
export function useResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  fallback: T
): T {
  const { breakpoint } = useLayout();

  return useMemo(() => {
    const orderedBreakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = orderedBreakpoints.indexOf(breakpoint);

    for (let i = currentIndex; i >= 0; i--) {
      const bp = orderedBreakpoints[i];
      if (values[bp] !== undefined) {
        return values[bp]!;
      }
    }

    return fallback;
  }, [breakpoint, values, fallback]);
}

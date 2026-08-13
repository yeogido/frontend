import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { APP_HEADER_HEIGHT, APP_MAX_WIDTH } from '../../constants/layout';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { getGutter } from '../../utils/responsiveLayout';

export type ResponsivePageShellMode = 'standalone' | 'main-layout';

export interface ResponsivePageShellProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  readonly children: ReactNode;
  readonly mode?: ResponsivePageShellMode;
  readonly topPadding?: number;
  readonly bottomPadding?: number;
  readonly headerHeight?: number;
  readonly fullBleed?: boolean;
}

export type ResponsiveFullBleedProps = HTMLAttributes<HTMLDivElement>;

type ResponsiveShellStyle = CSSProperties & {
  '--responsive-page-padding-start': string;
  '--responsive-page-padding-end': string;
};

export function ResponsiveFullBleed({
  className = '',
  style,
  ...props
}: ResponsiveFullBleedProps) {
  return (
    <div
      {...props}
      className={`min-w-0 ${className}`}
      style={{
        marginInlineStart:
          'calc(0px - var(--responsive-page-padding-start, 0px))',
        marginInlineEnd: 'calc(0px - var(--responsive-page-padding-end, 0px))',
        ...style,
      }}
    />
  );
}

export function ResponsivePageShell({
  children,
  mode = 'standalone',
  topPadding = 0,
  bottomPadding = 0,
  headerHeight = APP_HEADER_HEIGHT,
  fullBleed = false,
  className = '',
  style,
  ...props
}: ResponsivePageShellProps) {
  const scale = useGlobalScale();
  const gutter = fullBleed ? 0 : getGutter(scale);
  const horizontalStart = fullBleed
    ? 'env(safe-area-inset-left, 0px)'
    : `max(${gutter}px, env(safe-area-inset-left, 0px))`;
  const horizontalEnd = fullBleed
    ? 'env(safe-area-inset-right, 0px)'
    : `max(${gutter}px, env(safe-area-inset-right, 0px))`;
  const shellStyle: ResponsiveShellStyle = {
    '--responsive-page-padding-start': horizontalStart,
    '--responsive-page-padding-end': horizontalEnd,
    maxWidth: APP_MAX_WIDTH,
    minHeight:
      mode === 'standalone'
        ? '100dvh'
        : `calc(100dvh - ${headerHeight * scale}px)`,
    paddingTop: `max(${topPadding * scale}px, env(safe-area-inset-top, 0px))`,
    paddingRight: horizontalEnd,
    paddingBottom: `max(${bottomPadding * scale}px, env(safe-area-inset-bottom, 0px))`,
    paddingLeft: horizontalStart,
    ...style,
  };

  return (
    <div
      {...props}
      data-responsive-page-mode={mode}
      className={`mx-auto box-border flex w-full flex-col ${className}`}
      style={shellStyle}
    >
      {children}
    </div>
  );
}

export default ResponsivePageShell;

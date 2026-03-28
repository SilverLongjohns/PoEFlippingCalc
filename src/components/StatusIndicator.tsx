'use client';

import styled from '@emotion/styled';

const StatusBar = styled.div<{ variant: 'info' | 'error' | 'warning' }>`
  padding: 8px 16px;
  font-size: 13px;
  font-family: 'Fontin', Georgia, serif;
  background: ${({ variant }) =>
    variant === 'error' ? '#1a0a0a' :
    variant === 'warning' ? '#1a1508' :
    '#13110f'};
  color: ${({ variant }) =>
    variant === 'error' ? '#c44' :
    variant === 'warning' ? '#c8a04e' :
    '#a89272'};
  border: 1px solid ${({ variant }) =>
    variant === 'error' ? '#5a2020' :
    variant === 'warning' ? '#5a4a20' :
    '#3d3428'};
`;

interface StatusIndicatorProps {
  cachedAt: string | null;
  loading: boolean;
  error: string | null;
}

export function StatusIndicator({ cachedAt, loading, error }: StatusIndicatorProps) {
  if (loading) {
    return <StatusBar variant="info">Fetching data from the trade markets...</StatusBar>;
  }

  if (error) {
    return (
      <StatusBar variant="error">
        Error: {error}
        {cachedAt && ` (showing stale data from ${new Date(cachedAt).toLocaleTimeString()})`}
      </StatusBar>
    );
  }

  if (cachedAt) {
    return (
      <StatusBar variant="info">
        Last updated: {new Date(cachedAt).toLocaleTimeString()}
      </StatusBar>
    );
  }

  return null;
}

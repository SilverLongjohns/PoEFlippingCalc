'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import styled from '@emotion/styled';
import { League, FlipOpportunity, SortField } from '@/lib/types';
import { LeagueSelector } from '@/components/LeagueSelector';
import { ControlsBar } from '@/components/ControlsBar';
import { FlipTable } from '@/components/FlipTable';
import { StatusIndicator } from '@/components/StatusIndicator';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0c0b0a;
  color: #d9cdb8;
  font-family: 'Fontin', Georgia, 'Times New Roman', serif;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: linear-gradient(180deg, #1a1715 0%, #0f0e0c 100%);
  border-bottom: 1px solid #af6025;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6), inset 0 -1px 0 #8b6914;
`;

const Title = styled.h1`
  font-family: 'Cinzel', Georgia, serif;
  font-size: 22px;
  font-weight: 700;
  color: #c8a04e;
  margin: 0;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-shadow: 0 1px 4px rgba(175, 96, 37, 0.4);
`;

const Content = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TableContainer = styled.div`
  background: #151310;
  overflow: hidden;
  border: 1px solid #3d3428;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
`;

export default function Home() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [rawFlips, setRawFlips] = useState<FlipOpportunity[]>([]);
  const [sortBy, setSortBy] = useState<SortField>('profitPerTrade');
  const [minProfit, setMinProfit] = useState(0);
  const [minListings, setMinListings] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  // Client-side sorting and filtering — instant, no API call needed
  const flips = useMemo(() => {
    return rawFlips
      .filter((f) => f.profitPerTrade >= minProfit)
      .filter((f) => Math.min(f.buyListingCount, f.sellListingCount) >= minListings)
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [rawFlips, sortBy, minProfit, minListings]);

  // Fetch leagues on mount
  useEffect(() => {
    async function fetchLeagues() {
      try {
        const res = await fetch('/api/leagues');
        const { data, error } = await res.json();
        if (error) throw new Error(error);
        setLeagues(data || []);
        if (data && data.length > 0) {
          const saved = localStorage.getItem('selectedLeague');
          const validSaved = saved && data.some((l: League) => l.id === saved);
          if (validSaved) {
            setSelectedLeague(saved);
          } else {
            const challenge = data.find((l: League) => l.id !== 'Standard' && l.id !== 'Hardcore' && !l.id.includes('SSF'));
            setSelectedLeague(challenge?.id || data[0].id);
          }
        }
      } catch (err) {
        setError((err as Error).message);
      }
    }
    fetchLeagues();
  }, []);

  // Fetch raw flips from server (no sort/filter params — that's client-side)
  const fetchFlips = useCallback(async () => {
    if (!selectedLeague) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/flips?league=${encodeURIComponent(selectedLeague)}`);
      const { data, error, cachedAt } = await res.json();
      if (error) throw new Error(error);
      setRawFlips(data || []);
      setCachedAt(cachedAt);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [selectedLeague]);

  // Save league selection and fetch flips when league changes
  useEffect(() => {
    if (selectedLeague) {
      localStorage.setItem('selectedLeague', selectedLeague);
    }
    fetchFlips();
  }, [fetchFlips, selectedLeague]);

  return (
    <PageContainer>
      <Header>
        <Title>PoE Currency Flipper</Title>
        <LeagueSelector
          leagues={leagues}
          selected={selectedLeague}
          onChange={setSelectedLeague}
          loading={loading}
        />
      </Header>
      <Content>
        <StatusIndicator cachedAt={cachedAt} loading={loading} error={error} />
        <ControlsBar
          sortBy={sortBy}
          onSortChange={setSortBy}
          minProfit={minProfit}
          onMinProfitChange={setMinProfit}
          minListings={minListings}
          onMinListingsChange={setMinListings}
          onRefresh={fetchFlips}
          loading={loading}
        />
        <TableContainer>
          <FlipTable
            flips={flips}
            sortBy={sortBy}
            onSortChange={setSortBy}
            league={selectedLeague}
          />
        </TableContainer>
      </Content>
    </PageContainer>
  );
}

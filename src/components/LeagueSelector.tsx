'use client';

import styled from '@emotion/styled';
import { League } from '@/lib/types';

const Select = styled.select`
  padding: 6px 12px;
  font-size: 13px;
  font-family: 'Fontin', Georgia, serif;
  border: 1px solid #5a4a32;
  background: #1a1715;
  color: #d9cdb8;
  cursor: pointer;
  appearance: none;
  padding-right: 28px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23a89272'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;

  &:focus {
    outline: none;
    border-color: #af6025;
    box-shadow: 0 0 6px rgba(175, 96, 37, 0.3);
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a89272;
  font-size: 13px;
  font-family: 'Cinzel', Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
`;

interface LeagueSelectorProps {
  leagues: League[];
  selected: string;
  onChange: (league: string) => void;
  loading?: boolean;
}

export function LeagueSelector({ leagues, selected, onChange, loading }: LeagueSelectorProps) {
  return (
    <Label>
      League:
      <Select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        {leagues.map((league) => (
          <option key={league.id} value={league.id}>
            {league.id}
          </option>
        ))}
      </Select>
    </Label>
  );
}

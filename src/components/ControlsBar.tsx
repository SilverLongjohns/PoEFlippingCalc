'use client';

import styled from '@emotion/styled';
import { SortField } from '@/lib/types';

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: linear-gradient(180deg, #1a1715 0%, #13110f 100%);
  border: 1px solid #3d3428;
  flex-wrap: wrap;
`;

const ControlGroup = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #a89272;
  font-size: 12px;
  font-family: 'Cinzel', Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Select = styled.select`
  padding: 5px 8px;
  font-size: 13px;
  font-family: 'Fontin', Georgia, serif;
  border: 1px solid #5a4a32;
  background: #0c0b0a;
  color: #d9cdb8;
`;

const Input = styled.input`
  padding: 5px 8px;
  font-size: 13px;
  font-family: 'Fontin', Georgia, serif;
  border: 1px solid #5a4a32;
  background: #0c0b0a;
  color: #d9cdb8;
  width: 70px;

  &:focus {
    outline: none;
    border-color: #af6025;
  }
`;

const RefreshButton = styled.button`
  padding: 6px 18px;
  font-size: 12px;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: 1px solid #af6025;
  background: linear-gradient(180deg, #2a1a0a 0%, #1a1008 100%);
  color: #c8a04e;
  cursor: pointer;

  &:hover {
    background: linear-gradient(180deg, #3d2410 0%, #2a1a0a 100%);
    color: #e4c580;
    border-color: #c8a04e;
    box-shadow: 0 0 8px rgba(175, 96, 37, 0.3);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

interface ControlsBarProps {
  sortBy: SortField;
  onSortChange: (sort: SortField) => void;
  minProfit: number;
  onMinProfitChange: (value: number) => void;
  minListings: number;
  onMinListingsChange: (value: number) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function ControlsBar({
  sortBy,
  onSortChange,
  minProfit,
  onMinProfitChange,
  minListings,
  onMinListingsChange,
  onRefresh,
  loading,
}: ControlsBarProps) {
  return (
    <Bar>
      <ControlGroup>
        Sort:
        <Select value={sortBy} onChange={(e) => onSortChange(e.target.value as SortField)}>
          <option value="profitPerTrade">Profit per Trade</option>
          <option value="profitPerHour">Profit per Hour</option>
          <option value="roi">ROI %</option>
        </Select>
      </ControlGroup>

      <ControlGroup>
        Min Profit:
        <Input
          type="number"
          value={minProfit}
          onChange={(e) => onMinProfitChange(parseFloat(e.target.value) || 0)}
          min={0}
          step={0.1}
        />
      </ControlGroup>

      <ControlGroup>
        Min Listings:
        <Input
          type="number"
          value={minListings}
          onChange={(e) => onMinListingsChange(parseInt(e.target.value, 10) || 0)}
          min={0}
          step={1}
        />
      </ControlGroup>

      <RefreshButton onClick={onRefresh} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </RefreshButton>
    </Bar>
  );
}

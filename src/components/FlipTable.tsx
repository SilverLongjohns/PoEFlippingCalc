'use client';

import { useState, Fragment } from 'react';
import styled from '@emotion/styled';
import { FlipOpportunity, SortField, ValidationResult, TradeStep } from '@/lib/types';

// --- Base table styles ---

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-family: 'Fontin', Georgia, serif;
`;

const Th = styled.th<{ sortable?: boolean }>`
  padding: 10px 12px;
  text-align: left;
  background: #1a1715;
  color: #a89272;
  border-bottom: 1px solid #af6025;
  cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};
  user-select: none;
  white-space: nowrap;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;

  &:hover {
    ${({ sortable }) => sortable && 'color: #c8a04e;'}
  }
`;

const Tr = styled.tr<{ expanded?: boolean }>`
  background: ${({ expanded }) => (expanded ? '#1a1715' : 'transparent')};
  cursor: pointer;
  transition: background 0.1s;

  &:hover { background: #1a1715; }
  &:nth-of-type(even) { background: ${({ expanded }) => (expanded ? '#1a1715' : '#0f0e0c')}; }
  &:nth-of-type(even):hover { background: #1a1715; }
`;

const Td = styled.td`
  padding: 10px 12px;
  border-bottom: 1px solid #2a2318;
  color: #d9cdb8;
`;

const ProfitTd = styled(Td)<{ positive: boolean }>`
  color: ${({ positive }) => (positive ? '#22b14c' : '#c44')};
  font-weight: 600;
`;

const ExpandedRow = styled.tr`
  background: #13110f;
`;

const ExpandedContent = styled.td`
  padding: 16px 24px;
  border-bottom: 1px solid #3d3428;
`;

// --- Inline trade flow ---

const TradeFlow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CurrencyBubble = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
`;

const CurrencyImg = styled.img`
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 0 2px rgba(175, 96, 37, 0.3));
`;

const Arrow = styled.span`
  color: #8b6914;
  font-weight: 700;
  font-size: 14px;
`;

const ActionTag = styled.span<{ variant: 'buy' | 'sell' }>`
  font-size: 10px;
  font-weight: 700;
  font-family: 'Cinzel', Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ variant }) => (variant === 'buy' ? '#c8a04e' : '#22b14c')};
`;

const AmountText = styled.span`
  font-weight: 600;
  color: #e8daba;
`;

const CurrencyName = styled.span`
  color: #a89272;
  font-size: 12px;
`;

// --- Expanded step-by-step guide ---

const GuideBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 16px;
  border: 1px solid #3d3428;
  overflow: hidden;
`;

const StepRow = styled.div<{ variant: 'buy' | 'sell' | 'profit' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ variant }) =>
    variant === 'buy' ? '#1a1508' :
    variant === 'sell' ? '#0f1a0f' :
    '#1a1715'};
  border-left: 3px solid ${({ variant }) =>
    variant === 'buy' ? '#c8a04e' :
    variant === 'sell' ? '#22b14c' :
    '#af6025'};
`;

const StepBadge = styled.span<{ variant: 'buy' | 'sell' }>`
  font-size: 10px;
  font-weight: 700;
  font-family: 'Cinzel', Georgia, serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 2px 8px;
  min-width: 36px;
  text-align: center;
  border: 1px solid ${({ variant }) => (variant === 'buy' ? '#5a4a32' : '#2a4a2a')};
  color: ${({ variant }) => (variant === 'buy' ? '#c8a04e' : '#22b14c')};
  background: ${({ variant }) => (variant === 'buy' ? '#1a150800' : '#0a1a0a00')};
`;

const StepIcon = styled.img`
  width: 28px;
  height: 28px;
  filter: drop-shadow(0 0 3px rgba(175, 96, 37, 0.4));
`;

const StepDetail = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StepMain = styled.span`
  font-size: 14px;
  color: #e8daba;
`;

const StepSub = styled.span`
  font-size: 12px;
  color: #a89272;
`;

const StepListings = styled.span`
  font-size: 11px;
  color: #6e5b42;
  white-space: nowrap;
`;

const DividerRow = styled.div`
  padding: 2px 0 2px 32px;
  color: #3d3428;
  font-size: 14px;
  background: #0c0b0a;
`;

// --- Validation ---

const ValidateButton = styled.button`
  padding: 4px 12px;
  font-size: 11px;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #5a4a32;
  background: transparent;
  color: #a89272;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    border-color: #af6025;
    color: #c8a04e;
    box-shadow: 0 0 6px rgba(175, 96, 37, 0.3);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Badge = styled.span<{ variant: 'validated' | 'not_viable' | 'pending' }>`
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid ${({ variant }) =>
    variant === 'validated' ? '#2a5a20' :
    variant === 'not_viable' ? '#5a2020' : '#5a4a20'};
  color: ${({ variant }) =>
    variant === 'validated' ? '#22b14c' :
    variant === 'not_viable' ? '#c44' : '#c8a04e'};
`;

const ValidationBox = styled.div<{ variant: 'success' | 'fail' }>`
  margin-top: 12px;
  padding: 10px 14px;
  background: ${({ variant }) => (variant === 'success' ? '#0f1a0f' : '#1a0f0f')};
  border: 1px solid ${({ variant }) => (variant === 'success' ? '#2a5a20' : '#5a2020')};
`;

const ValidationHeader = styled.div`
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ListingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
`;

const ListingTh = styled.th`
  padding: 6px 8px;
  text-align: left;
  color: #6e5b42;
  border-bottom: 1px solid #3d3428;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ListingTd = styled.td`
  padding: 6px 8px;
  color: #a89272;
  border-bottom: 1px solid #1a1715;
`;

// --- Helpers ---

interface FlipTableProps {
  flips: FlipOpportunity[];
  sortBy: SortField;
  onSortChange: (sort: SortField) => void;
  league: string;
  poesessid: string;
}

function getPrimarySteps(flip: FlipOpportunity): { buyStep: TradeStep; sellStep: TradeStep } {
  const primaryName = flip.buyCurrency.name.replace(/ \(via Divine\)$/, '');
  const buyStep = flip.steps.find((s) => s.action === 'buy' && s.currency === primaryName) ?? flip.steps[0];
  const sellStep = flip.steps.find((s) => s.action === 'sell' && s.currency === primaryName) ?? flip.steps[flip.steps.length - 1];
  return { buyStep, sellStep };
}

function fmtAmount(n: number): string {
  if (n >= 100) return n.toFixed(0);
  if (n >= 10) return n.toFixed(1);
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.01) return n.toFixed(3);
  return n.toFixed(4);
}

function describeStep(step: TradeStep) {
  if (step.price >= 1) {
    return {
      amount: fmtAmount(step.price),
      currencyName: step.priceCurrency,
      currencyIcon: step.priceCurrencyIcon,
      itemName: step.currency,
      itemIcon: step.currencyIcon,
      inverted: false,
    };
  }
  return {
    amount: fmtAmount(1 / step.price),
    currencyName: step.priceCurrency,
    currencyIcon: step.priceCurrencyIcon,
    itemName: step.currency,
    itemIcon: step.currencyIcon,
    inverted: true,
  };
}

// --- Component ---

export function FlipTable({ flips, sortBy, onSortChange, league, poesessid }: FlipTableProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [validating, setValidating] = useState<number | null>(null);
  const [validationResults, setValidationResults] = useState<Map<number, ValidationResult>>(new Map());

  const handleValidate = async (index: number, flip: FlipOpportunity) => {
    setValidating(index);
    try {
      const response = await fetch('/api/trade/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          league,
          wantCurrency: flip.buyCurrency.tradeId,
          haveCurrency: flip.sellCurrency.tradeId,
          poesessid: poesessid || undefined,
        }),
      });
      const { data } = await response.json();
      if (data) {
        setValidationResults((prev) => new Map(prev).set(index, data));
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setValidating(null);
    }
  };

  const getSortIndicator = (field: SortField) => (sortBy === field ? ' \u25BC' : '');

  if (flips.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#6e5b42', fontFamily: "'Fontin', Georgia, serif" }}>
        No profitable flips found. Adjust your filters or select a different league.
      </div>
    );
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>Trade</Th>
          <Th sortable onClick={() => onSortChange('profitPerTrade')}>
            Profit/Trade{getSortIndicator('profitPerTrade')}
          </Th>
          <Th sortable onClick={() => onSortChange('profitPerHour')}>
            Profit/Hour{getSortIndicator('profitPerHour')}
          </Th>
          <Th sortable onClick={() => onSortChange('roi')}>
            ROI %{getSortIndicator('roi')}
          </Th>
          <Th>Listings</Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody>
        {flips.map((flip, i) => {
          const isExpanded = expandedIndex === i;
          const validation = validationResults.get(i);
          const { buyStep, sellStep } = getPrimarySteps(flip);
          const buy = describeStep(buyStep);
          const sell = describeStep(sellStep);

          return (
            <Fragment key={i}>
              <Tr
                expanded={isExpanded}
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
              >
                <Td>
                  <TradeFlow>
                    <CurrencyBubble>
                      <ActionTag variant="buy">Buy</ActionTag>
                      {buy.currencyIcon && <CurrencyImg src={buy.currencyIcon} alt={buy.currencyName} />}
                      <AmountText>{buy.amount}</AmountText>
                      <CurrencyName>{buy.currencyName.replace(' Orb', '')}</CurrencyName>
                    </CurrencyBubble>

                    <Arrow>&rarr;</Arrow>

                    <CurrencyBubble>
                      {buy.itemIcon && <CurrencyImg src={buy.itemIcon} alt={buy.itemName} />}
                      <AmountText>{buy.inverted ? buy.amount : '1'}</AmountText>
                      <CurrencyName>{buy.itemName}</CurrencyName>
                    </CurrencyBubble>

                    <Arrow>&rarr;</Arrow>

                    <CurrencyBubble>
                      <ActionTag variant="sell">Sell</ActionTag>
                      {sell.currencyIcon && <CurrencyImg src={sell.currencyIcon} alt={sell.currencyName} />}
                      <AmountText>{sell.amount}</AmountText>
                      <CurrencyName>{sell.currencyName.replace(' Orb', '')}</CurrencyName>
                    </CurrencyBubble>
                  </TradeFlow>
                </Td>
                <ProfitTd positive={flip.profitPerTrade > 0}>
                  {flip.profitPerTrade.toFixed(2)}c
                </ProfitTd>
                <ProfitTd positive={flip.profitPerHour > 0}>
                  {flip.profitPerHour.toFixed(1)}c
                </ProfitTd>
                <ProfitTd positive={flip.roi > 0}>
                  {flip.roi.toFixed(1)}%
                </ProfitTd>
                <Td style={{ color: '#a89272' }}>{Math.min(flip.buyListingCount, flip.sellListingCount)}</Td>
                <Td>
                  {validation ? (
                    <Badge variant={validation.viable ? 'validated' : 'not_viable'}>
                      {validation.viable
                        ? `Confirmed (${validation.listings.length} sellers)`
                        : 'No sellers found'}
                    </Badge>
                  ) : (
                    <ValidateButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleValidate(i, flip);
                      }}
                      disabled={validating === i}
                    >
                      {validating === i ? 'Checking...' : 'Verify Live'}
                    </ValidateButton>
                  )}
                </Td>
              </Tr>

              {isExpanded && (
                <ExpandedRow>
                  <ExpandedContent colSpan={6}>
                    <GuideBox>
                      <StepRow variant="buy">
                        <StepBadge variant="buy">Buy</StepBadge>
                        {buy.itemIcon && <StepIcon src={buy.itemIcon} alt={buy.itemName} />}
                        <StepDetail>
                          <StepMain>
                            {buy.inverted ? (
                              <>Buy <strong>{buy.amount} {buy.itemName}</strong></>
                            ) : (
                              <>Buy <strong>1 {buy.itemName}</strong></>
                            )}
                          </StepMain>
                          <StepSub>
                            Pay{' '}
                            {buy.currencyIcon && <CurrencyImg src={buy.currencyIcon} alt={buy.currencyName} style={{ width: 16, height: 16, verticalAlign: 'text-bottom' }} />}
                            {' '}{buy.inverted ? '1' : buy.amount} {buy.currencyName}
                            {buy.inverted && <> (rate: {buy.amount} per 1 {buy.currencyName})</>}
                          </StepSub>
                        </StepDetail>
                        <StepListings>{buyStep.listings} listings</StepListings>
                      </StepRow>

                      <DividerRow>&darr;</DividerRow>

                      <StepRow variant="sell">
                        <StepBadge variant="sell">Sell</StepBadge>
                        {sell.itemIcon && <StepIcon src={sell.itemIcon} alt={sell.itemName} />}
                        <StepDetail>
                          <StepMain>
                            {sell.inverted ? (
                              <>Sell <strong>{sell.amount} {sell.itemName}</strong></>
                            ) : (
                              <>Sell <strong>1 {sell.itemName}</strong></>
                            )}
                          </StepMain>
                          <StepSub>
                            Receive{' '}
                            {sell.currencyIcon && <CurrencyImg src={sell.currencyIcon} alt={sell.currencyName} style={{ width: 16, height: 16, verticalAlign: 'text-bottom' }} />}
                            {' '}{sell.inverted ? '1' : sell.amount} {sell.currencyName}
                            {sell.inverted && <> (rate: {sell.amount} per 1 {sell.currencyName})</>}
                          </StepSub>
                        </StepDetail>
                        <StepListings>{sellStep.listings} listings</StepListings>
                      </StepRow>

                      {flip.steps.length > 2 && sell.currencyName !== flip.steps[flip.steps.length - 1].priceCurrency && (
                        <>
                          <DividerRow>&darr;</DividerRow>
                          <StepRow variant="sell">
                            <StepBadge variant="sell">Conv</StepBadge>
                            {flip.steps[flip.steps.length - 1].priceCurrencyIcon && (
                              <StepIcon
                                src={flip.steps[flip.steps.length - 1].priceCurrencyIcon ?? ''}
                                alt={flip.steps[flip.steps.length - 1].priceCurrency}
                              />
                            )}
                            <StepDetail>
                              <StepMain>
                                Convert <strong>{sell.currencyName}</strong> to <strong>{flip.steps[flip.steps.length - 1].priceCurrency}</strong>
                              </StepMain>
                              <StepSub>
                                Rate: {fmtAmount(flip.steps[flip.steps.length - 1].price)} {flip.steps[flip.steps.length - 1].priceCurrency} per 1 {sell.currencyName}
                              </StepSub>
                            </StepDetail>
                            <StepListings>{flip.steps[flip.steps.length - 1].listings} listings</StepListings>
                          </StepRow>
                        </>
                      )}

                      <DividerRow>&darr;</DividerRow>

                      <StepRow variant="profit">
                        <StepBadge variant="buy" style={{ borderColor: '#af6025', color: '#af6025' }}>=</StepBadge>
                        <StepDetail>
                          <StepMain>
                            <strong style={{ color: '#c8a04e' }}>{flip.profitPerTrade.toFixed(2)}c profit</strong> per trade
                          </StepMain>
                          <StepSub>
                            {flip.roi.toFixed(1)}% ROI &middot; ~{flip.profitPerHour.toFixed(0)}c/hr
                          </StepSub>
                        </StepDetail>
                      </StepRow>
                    </GuideBox>

                    {validation ? (
                      <ValidationBox variant={validation.viable ? 'success' : 'fail'}>
                        <ValidationHeader style={{ color: validation.viable ? '#22b14c' : '#c44' }}>
                          {validation.viable
                            ? `Live Verified: ${validation.listings.length} active seller${validation.listings.length !== 1 ? 's' : ''} found`
                            : 'Not Verified: No active sellers found on the trade site for this pair'}
                          {validation.avgRate !== null && validation.viable && (
                            <span style={{ color: '#a89272', fontWeight: 400 }}>
                              {' '}(avg rate: {validation.avgRate.toFixed(2)})
                            </span>
                          )}
                        </ValidationHeader>
                        {validation.listings.length > 0 && (
                          <ListingTable>
                            <thead>
                              <tr>
                                <ListingTh>Account</ListingTh>
                                <ListingTh>Stock</ListingTh>
                                <ListingTh>Rate</ListingTh>
                                <ListingTh>Listed</ListingTh>
                              </tr>
                            </thead>
                            <tbody>
                              {validation.listings.map((listing, j) => (
                                <tr key={j}>
                                  <ListingTd>{listing.accountName}</ListingTd>
                                  <ListingTd>{listing.stock}</ListingTd>
                                  <ListingTd>{listing.conversionRate.toFixed(2)}</ListingTd>
                                  <ListingTd>
                                    {new Date(listing.listingAge).toLocaleDateString()}
                                  </ListingTd>
                                </tr>
                              ))}
                            </tbody>
                          </ListingTable>
                        )}
                      </ValidationBox>
                    ) : (
                      <div style={{ color: '#6e5b42', fontSize: '12px' }}>
                        Click &quot;Verify Live&quot; to check real-time trade listings for this flip.
                      </div>
                    )}
                  </ExpandedContent>
                </ExpandedRow>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </Table>
  );
}

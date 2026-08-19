"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useWalletClient } from 'wagmi';
import { formatUnits, isAddress, parseAbi, parseUnits } from 'viem';
import { CHAIN_KEY, FAUCET_TRANSACTION_CONFIG, PPDC_CONTRACT_ADDRESS } from '@/lib/chain';
import { publicClient } from '@/lib/publicClient';

const PPDC_DECIMALS = 6;
const MAX_REFILL = 100_000_000n;
const MIN_ALLOWANCE = 10_000_000n;
const LOW_ALLOWANCE_WARNING = ((MAX_REFILL - MIN_ALLOWANCE) * 20n / 100n) + MIN_ALLOWANCE;

const FAUCET_ABI = parseAbi([
  'function faucet(address to, uint256 value) returns (bool)',
  'function faucetRemainingAmount(address account) view returns (uint256)',
  'function faucetNextRefill(address account) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
]);

function shortAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatPpdc(value) {
  return Number(formatUnits(value ?? 0n, PPDC_DECIMALS)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parsePpdcInput(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) return 0n;
  return parseUnits(normalized, PPDC_DECIMALS);
}

function refillLabel(nextRefill, effectiveRemaining) {
  if (!nextRefill || nextRefill === 0n || effectiveRemaining > 0n) return 'Available now';
  return new Date(Number(nextRefill) * 1000).toLocaleString();
}

function allowanceClassName(effectiveRemaining) {
  if (effectiveRemaining < MIN_ALLOWANCE) return 'allowance-value allowance-empty';
  if (effectiveRemaining <= LOW_ALLOWANCE_WARNING) return 'allowance-value allowance-low';
  return 'allowance-value';
}

export default function FaucetClient() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [amount, setAmount] = useState('100');
  const [remaining, setRemaining] = useState(0n);
  const [nextRefill, setNextRefill] = useState(0n);
  const [balance, setBalance] = useState(null);
  const [hasLoadedAllowance, setHasLoadedAllowance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const effectiveRemaining = useMemo(() => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    return now > nextRefill ? MAX_REFILL : remaining;
  }, [nextRefill, remaining]);

  const requestedAmount = useMemo(() => {
    try {
      return parsePpdcInput(amount);
    } catch {
      return null;
    }
  }, [amount]);

  const cappedAmount = requestedAmount == null
    ? 0n
    : requestedAmount > effectiveRemaining ? effectiveRemaining : requestedAmount;
  const canFund = isConnected
    && walletClient
    && hasLoadedAllowance
    && isAddress(PPDC_CONTRACT_ADDRESS)
    && requestedAmount != null
    && cappedAmount > 0n
    && !isFunding;

  const loadAllowance = useCallback(async () => {
    if (!address || !isAddress(PPDC_CONTRACT_ADDRESS)) {
      setRemaining(0n);
      setNextRefill(0n);
      setBalance(null);
      setHasLoadedAllowance(false);
      return;
    }

    setIsLoading(true);
    try {
      const [remainingAmount, refillAt, ppdcBalance] = await Promise.all([
        publicClient.readContract({
          address: PPDC_CONTRACT_ADDRESS,
          abi: FAUCET_ABI,
          functionName: 'faucetRemainingAmount',
          args: [address],
        }),
        publicClient.readContract({
          address: PPDC_CONTRACT_ADDRESS,
          abi: FAUCET_ABI,
          functionName: 'faucetNextRefill',
          args: [address],
        }),
        publicClient.readContract({
          address: PPDC_CONTRACT_ADDRESS,
          abi: FAUCET_ABI,
          functionName: 'balanceOf',
          args: [address],
        }),
      ]);
      setRemaining(remainingAmount);
      setNextRefill(refillAt);
      setBalance(ppdcBalance);
      setHasLoadedAllowance(true);
    } catch (err) {
      console.error('Failed to load faucet account:', err);
      setError('Could not read faucet allowance.');
      setHasLoadedAllowance(false);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadAllowance();
  }, [loadAllowance]);

  const fundAccount = useCallback(async () => {
    if (!canFund) return;
    setError('');
    setMessage('');
    setIsFunding(true);

    try {
      const hash = await walletClient.writeContract({
        address: PPDC_CONTRACT_ADDRESS,
        abi: FAUCET_ABI,
        functionName: 'faucet',
        account: address,
        args: [address, cappedAmount],
        ...FAUCET_TRANSACTION_CONFIG,
      });

      setMessage('Funding transaction submitted. Waiting for confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== 'success') {
        throw new Error(`Funding reverted in transaction ${hash}`);
      }
      setMessage(`Funded ${formatPpdc(cappedAmount)} PPDC.`);
      await loadAllowance();
    } catch (err) {
      console.error('Funding failed:', err);
      setError(err?.shortMessage ?? err?.message ?? 'Funding failed.');
    } finally {
      setIsFunding(false);
    }
  }, [address, canFund, cappedAmount, loadAllowance, walletClient]);

  return (
    <main className="page-shell">
      <section className="faucet-panel">
        <div className="panel-copy">
          <p className="eyebrow">Private Poker</p>
          <h1>PPDC Faucet</h1>
          <p>
            Self-service test funding for the wallet you connect. The faucet caps each account at
            $100 PPDC per refill period.
          </p>
          <div className="network-pill">{CHAIN_KEY}</div>
        </div>

        <div className="faucet-card">
          <label className="field">
            <span>Wallet Address</span>
            <output title={address ?? ''}>{address ?? 'Not connected'}</output>
          </label>

          <label className="field">
            <span>Remaining PPDC Funding Allowance</span>
            <output className={allowanceClassName(effectiveRemaining)}>
              {isLoading ? 'Loading...' : `${formatPpdc(effectiveRemaining)} PPDC`}
            </output>
            {isConnected && (
              <small>Next refill: {refillLabel(nextRefill, effectiveRemaining)}</small>
            )}
          </label>

          <label className="field">
            <span>Amount of PPDC to Fund</span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={!isConnected || isFunding}
            />
            {requestedAmount != null && requestedAmount !== cappedAmount && (
              <small>Transaction will be capped to {formatPpdc(cappedAmount)} PPDC.</small>
            )}
          </label>

          {balance !== null && (
            <div className="balance-row">
              <span>Current PPDC balance</span>
              <strong>{formatPpdc(balance)} PPDC</strong>
            </div>
          )}

          {!isConnected ? (
            <button className="primary-button" type="button" onClick={() => open()}>
              Connect Wallet
            </button>
          ) : (
            <button className="primary-button" type="button" disabled={!canFund} onClick={fundAccount}>
              {isFunding ? 'Funding...' : 'Fund Account'}
            </button>
          )}

          {message && <div className="notice success">{message}</div>}
          {error && <div className="notice error">{error}</div>}
        </div>
      </section>
    </main>
  );
}

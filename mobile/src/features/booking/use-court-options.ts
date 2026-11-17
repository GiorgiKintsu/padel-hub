import { useNow } from '@/hooks/use-now';

import { DEMO_COURTS } from './domain/courts';
import { findOptions, type CourtOption, type Search } from './domain/schedule';

/**
 * The courts that can host a search, best first.
 *
 * This hook is the single place that knows where courts come from. Today that is the demo fixtures;
 * when a real club calendar exists, only this file changes and the screens stay as they are.
 */
export function useCourtOptions(search: Search): CourtOption[] {
  // Refreshed every minute so a start time drops out once its booking cutoff passes.
  const now = useNow(60_000);
  return findOptions(DEMO_COURTS, search, now);
}

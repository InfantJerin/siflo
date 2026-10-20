import type { TFunction } from 'i18next';

import type { Activity, EarlierVisitOutcome } from '@/store/types';
import { colors } from '@/theme/tokens';
import { inr } from './format';

/** One-line summary used by history rows and detail sheets, e.g. "Promise · ₹5,000". */
export function activityHeadline(t: TFunction, a: Activity): string {
  if (a.kind === 'collection') {
    return t('history.collectionLine', { amount: inr(a.amount), method: t(`common.${a.method}`).toLowerCase() });
  }
  if (a.outcome === 'willPay' && a.amount) return t('history.promiseLine', { amount: inr(a.amount) });
  if (a.outcome === 'escalate') return `${t('outcome.visit')} · ${t('outcome.escalated')}`;
  return `${t('outcome.visit')} · ${t(`outcome.${a.outcome}`)}`;
}

export function activityTone(a: Activity): string {
  if (a.kind === 'visit' && a.outcome === 'escalate') return colors.red;
  return colors.green;
}

/** "Photo + voice note" style evidence suffix, or undefined if none. */
export function evidenceLabel(t: TFunction, a: Activity): string | undefined {
  if (a.kind !== 'visit') return undefined;
  if (a.photo && a.voice) return t('history.evidence');
  if (a.photo) return t('history.photoOnly');
  if (a.voice) return t('history.voiceOnly');
  return undefined;
}

export function earlierOutcomeLabel(t: TFunction, outcome: EarlierVisitOutcome, amount?: number) {
  switch (outcome) {
    case 'collected':
      return { label: t('outcome.collected', { amount: inr(amount ?? 0) }), color: colors.green };
    case 'promised':
      return { label: t('outcome.promisedToPay'), color: colors.green };
    case 'escalated':
      return { label: t('outcome.escalated'), color: colors.red };
    default:
      return { label: t('outcome.notAvailable'), color: colors.red };
  }
}

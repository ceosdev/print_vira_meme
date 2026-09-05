import { strings } from '@/i18n/strings';
import type { PaywallTrigger } from '@/types/analytics';
import { FONTS, type FontFace, type Preset } from '@/types/catalog';
import type { Entitlements } from '@/types/entitlements';

export function paywallContext(trigger: PaywallTrigger, presetName?: string): string | null {
  const ctx = strings.paywall.context[trigger];
  if (typeof ctx === 'function') return ctx(presetName ?? 'este template');
  return ctx;
}

export function isPresetUnlocked(preset: Pick<Preset, 'premium' | 'packId'>, e: Entitlements): boolean {
  if (!preset.premium) return true;
  if (e.isPro) return true;
  return preset.packId !== undefined && e.packIds.includes(preset.packId);
}

export function isFontUnlocked(face: FontFace, isPro: boolean): boolean {
  return isPro || !FONTS[face].premium;
}

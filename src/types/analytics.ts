import type { CategoryId, SlotType } from './catalog';
import type { ExportQuality, ImageSource } from './creation';

export type PaywallTrigger =
  | 'premium_template'
  | 'premium_font'
  | 'premium_style'
  | 'remove_watermark'
  | 'share_milestone'
  | 'ad_close'
  | 'home_card'
  | 'settings';

/** União discriminada: impossível emitir evento com propriedade errada. Nunca carrega texto do usuário. */
export type AnalyticsEvent =
  | { name: 'app_open'; entry: 'launcher' | 'share_intent' }
  | { name: 'image_selected'; source: ImageSource }
  | { name: 'preset_selected'; presetId: string; layoutId: string; category: CategoryId; premium: boolean }
  | { name: 'suggestion_used'; phraseId: string }
  | { name: 'text_edited'; slotType: SlotType }
  | { name: 'meme_exported'; presetId: string; quality: ExportQuality; hasBrand: boolean; durationMs: number }
  | { name: 'export_failed'; reason: string }
  | { name: 'meme_shared'; presetId: string }
  | { name: 'meme_saved'; presetId: string }
  | { name: 'remake_same_photo' }
  | { name: 'paywall_shown'; trigger: PaywallTrigger }
  | { name: 'purchase_started'; sku: string }
  | { name: 'purchase_completed'; sku: string }
  | { name: 'purchase_restored'; sku: string }
  | { name: 'ad_shown'; type: 'interstitial' | 'rewarded' };

export type AnalyticsEventName = AnalyticsEvent['name'];

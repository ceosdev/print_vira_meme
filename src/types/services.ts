import type { AnalyticsEvent } from './analytics';
import type { Layout, TemplateValues } from './catalog';
import type {
  Creation, ExportQuality, ExportResult, ExtraText, ImageSource, ImageTransform, ImportedImage, StyleChoice,
} from './creation';
import type { Entitlements } from './entitlements';

export type PickResult = { status: 'ok'; image: ImportedImage } | { status: 'cancelled' | 'denied' | 'error' };

export interface ImageService {
  pick(source: 'gallery' | 'camera'): Promise<PickResult>;
  importUri(uri: string, source: ImageSource): Promise<ImportedImage>;
  cleanupCache(maxAgeMs: number): Promise<void>;
  clearCache(): Promise<void>;
}

export interface ExportRequest {
  layout: Layout;
  values: TemplateValues;
  positions: Creation['positions'];
  extraTexts: ExtraText[];
  image: ImportedImage;
  imageTransform: ImageTransform;
  style: StyleChoice;
  showBrand: boolean;
  quality: ExportQuality;
}

export interface ExportService {
  exportMeme(req: ExportRequest): Promise<ExportResult>;
}

export type ShareOutcome = 'opened' | 'unavailable' | 'error';
export interface ShareService {
  shareImage(uri: string, mime: 'image/jpeg' | 'image/png'): Promise<ShareOutcome>;
  shareText(text: string): Promise<ShareOutcome>;
}

export type SaveOutcome = 'saved' | 'denied' | 'error';
export interface MediaService {
  saveToGallery(uri: string): Promise<SaveOutcome>;
}

export type PurchaseOutcome =
  | { status: 'purchased' | 'restored' }
  | { status: 'none' | 'cancelled' | 'offline' }
  | { status: 'error'; message: string };

export interface PurchaseService {
  init(): Promise<void>;
  /** Preço localizado vindo da loja ("R$ 19,90") ou null se indisponível. */
  getProPrice(): Promise<string | null>;
  purchasePro(): Promise<PurchaseOutcome>;
  restore(): Promise<PurchaseOutcome>;
  onEntitlementsChange(cb: (e: Entitlements) => void): () => void;
}

export type AdShowOutcome = 'shown' | 'not_ready' | 'error';
export interface AdsService {
  init(): void;
  isInterstitialReady(): boolean;
  preloadInterstitial(): void;
  showInterstitial(): Promise<AdShowOutcome>;
}

export interface AnalyticsService {
  track(event: AnalyticsEvent): void;
  setEnabled(enabled: boolean): void;
}

export interface CrashService {
  captureException(error: unknown, context?: Record<string, string>): void;
}

export interface Services {
  image: ImageService;
  export: ExportService;
  share: ShareService;
  media: MediaService;
  purchase: PurchaseService;
  ads: AdsService;
  analytics: AnalyticsService;
  crash: CrashService;
}

import type { Services } from '@/types/services';
import { createExportService } from './exportService';
import { createImageService } from './imageService';
import { createMediaService } from './mediaService';
import { createMockAdsService } from './mock/mockAdsService';
import { createMockAnalyticsService } from './mock/mockAnalyticsService';
import { createMockCrashService } from './mock/mockCrashService';
import { createMockPurchaseService } from './mock/mockPurchaseService';
import { createShareService } from './shareService';

/**
 * Registro único de serviços. image/export/share/media são reais; purchase/ads/analytics/crash
 * ainda são mocks (Planos 2 e 3). Testes de tela trocam o que precisam com configureServices().
 */
export const services: Services = {
  image: createImageService(),
  export: createExportService(),
  share: createShareService(),
  media: createMediaService(),
  purchase: createMockPurchaseService(),
  ads: createMockAdsService(),
  analytics: createMockAnalyticsService(),
  crash: createMockCrashService(),
};

export function configureServices(patch: Partial<Services>): void {
  Object.assign(services, patch);
}

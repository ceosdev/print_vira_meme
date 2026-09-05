import type { Services } from '@/types/services';
import { createMockAdsService } from './mock/mockAdsService';
import { createMockAnalyticsService } from './mock/mockAnalyticsService';
import { createMockCrashService } from './mock/mockCrashService';
import { createMockExportService } from './mock/mockExportService';
import { createMockImageService } from './mock/mockImageService';
import { createMockMediaService } from './mock/mockMediaService';
import { createMockPurchaseService } from './mock/mockPurchaseService';
import { createMockShareService } from './mock/mockShareService';

/**
 * Registro único de serviços. Neste plano são todos mocks; o Plano 1b troca image/export/share/media
 * pelas implementações reais e os Planos 2/3 trocam purchase/ads/analytics/crash.
 */
export const services: Services = {
  image: createMockImageService(),
  export: createMockExportService(),
  share: createMockShareService(),
  media: createMockMediaService(),
  purchase: createMockPurchaseService(),
  ads: createMockAdsService(),
  analytics: createMockAnalyticsService(),
  crash: createMockCrashService(),
};

export function configureServices(patch: Partial<Services>): void {
  Object.assign(services, patch);
}

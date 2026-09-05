import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import { strings } from '@/i18n/strings';
import type { ShareService } from '@/types/services';

export function createShareService(): ShareService {
  return {
    shareImage: async (uri, mimeType) => {
      try {
        if (!(await Sharing.isAvailableAsync())) return 'unavailable';
        await Sharing.shareAsync(uri, { mimeType, dialogTitle: strings.result.shareDialogTitle });
        return 'opened';
      } catch {
        return 'error';
      }
    },
    shareText: async (message) => {
      try {
        await Share.share({ message });
        return 'opened';
      } catch {
        return 'error';
      }
    },
  };
}

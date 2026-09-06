import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import { ExternalLink, Image as ImageIcon, RefreshCw, Share2, Star, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ListItem } from '@/components/ui/ListItem';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { CACHE_MAX_AGE_MS, PLAY_URL, PRIVACY_URL } from '@/config/app';
import { useInvite } from '@/hooks/useInvite';
import { useEntitlements } from '@/hooks/useEntitlements';
import { strings } from '@/i18n/strings';
import { services } from '@/services';
import { useEntitlementStore } from '@/store/entitlementStore';
import { usePrefsStore } from '@/store/prefsStore';
import { useToastStore } from '@/store/toastStore';
import { colors, radius, spacing } from '@/theme/tokens';
import { typography } from '@/theme/typography';

export default function SettingsScreen() {
  const router = useRouter();
  const { isPro } = useEntitlements();
  const analyticsEnabled = usePrefsStore((s) => s.analyticsEnabled);
  const [restoring, setRestoring] = useState(false);
  const { invite } = useInvite();

  const restore = async () => {
    setRestoring(true);
    const outcome = await services.purchase.restore();
    setRestoring(false);
    if (outcome.status === 'restored') {
      useEntitlementStore.getState().setEntitlements({ isPro: true, packIds: [] });
      useToastStore.getState().show(strings.paywall.restored, 'success');
    } else {
      useToastStore.getState().show(outcome.status === 'none' ? strings.paywall.restoreNone : strings.paywall.error);
    }
  };

  const toggleAnalytics = (value: boolean) => {
    usePrefsStore.getState().setAnalyticsEnabled(value);
    services.analytics.setEnabled(value);
  };

  return (
    <Screen>
      <Header title={strings.settings.title} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.proCard}>
          <ListItem
            title={isPro ? strings.settings.youArePro : strings.settings.knowPro}
            onPress={isPro ? undefined : () => router.push('/pro')}
            chevron={!isPro}
            testID="pro-status"
          />
        </View>

        <ListItem title={strings.settings.restore} icon={RefreshCw} onPress={() => void restore()} right={restoring ? <Text style={typography.caption}>…</Text> : undefined} testID="restore" />
        <ListItem title={strings.settings.shareApp} icon={Share2} onPress={() => void invite()} testID="share-app" />
        <ListItem title={strings.settings.rate} icon={Star} onPress={() => void Linking.openURL(PLAY_URL)} testID="rate" />

        <View style={styles.privacyBlock}>
          <Text style={[typography.label, { color: colors.text }]}>{strings.settings.photos}</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{strings.settings.photosBody}</Text>
        </View>

        <ListItem title={strings.settings.privacy} icon={ExternalLink} onPress={() => void Linking.openURL(PRIVACY_URL)} testID="privacy" />
        <ListItem
          title={strings.settings.analytics}
          icon={ImageIcon}
          chevron={false}
          right={<Switch value={analyticsEnabled} onValueChange={toggleAnalytics} testID="analytics-switch" trackColor={{ true: colors.primary, false: colors.surface2 }} />}
        />
        <ListItem
          title={strings.settings.clearCache}
          icon={Trash2}
          onPress={() => {
            void services.image.clearCache().then(() => useToastStore.getState().show(strings.settings.cacheCleared, 'success'));
          }}
          testID="clear-cache"
        />

        <Text style={[typography.caption, styles.version]}>
          {strings.settings.version(Application.nativeApplicationVersion ?? '0.1.0')}
        </Text>
        <Text style={[typography.caption, styles.version]}>{`cache: ${Math.round(CACHE_MAX_AGE_MS / 3600000)}h`}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: spacing.xxxl },
  proCard: { backgroundColor: colors.surface, borderRadius: radius.card, marginHorizontal: spacing.lg, marginBottom: spacing.lg, overflow: 'hidden' },
  privacyBlock: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.xs },
  version: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});

import { useCountersStore } from './countersStore';
import { useEntitlementStore } from './entitlementStore';
import { usePrefsStore } from './prefsStore';

interface Persisted {
  persist: { hasHydrated(): boolean; onFinishHydration(cb: () => void): () => void };
}

const persisted: Persisted[] = [useCountersStore, useEntitlementStore, usePrefsStore];

/** Resolve quando os três stores persistidos terminaram de ler o AsyncStorage. */
export function waitForHydration(): Promise<void> {
  return Promise.all(
    persisted.map(
      (store) =>
        new Promise<void>((resolve) => {
          if (store.persist.hasHydrated()) return resolve();
          const unsub = store.persist.onFinishHydration(() => {
            unsub();
            resolve();
          });
        }),
    ),
  ).then(() => undefined);
}

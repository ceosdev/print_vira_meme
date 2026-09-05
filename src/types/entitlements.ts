export interface Entitlements {
  isPro: boolean;
  /** v1.1: packs comprados avulsos (entitlement `pack_<id>` → id) */
  packIds: string[];
}

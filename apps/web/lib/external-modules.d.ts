declare module "iframe-shared-storage" {
  export function constructClient(config: unknown): any;
}

declare module "tfhe" {
  const init: () => Promise<void>;
  export default init;
  export const init_panic_hook: () => Promise<void>;
  export const TfheCompactPublicKey: any;
  export const ProvenCompactCiphertextList: any;
  export const CompactPkeCrs: any;
}

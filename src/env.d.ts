interface ImportMetaEnv {
  readonly PUBLIC_SB_PROJECT_ID: string;
  readonly PUBLIC_SB_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: {
      id: string;
    };
  }
}

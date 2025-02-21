declare module "home-config" {
  interface LoadConfig {
    load<T extends Record<string, any>>(
      path: string,
      defaults?: T
    ): T & {
      save: () => void;
      __filename: string;
    };
  }

  const LoadConfig: LoadConfig;
  export default LoadConfig;
}

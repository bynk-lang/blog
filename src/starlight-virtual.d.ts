// Types for the Starlight virtual modules that src/components/Header.astro
// imports. Starlight resolves these at build time but ships no declarations
// for them, so `astro check` can't see them without this file.

declare module "virtual:starlight/user-config" {
  const config: import("@astrojs/starlight/types").StarlightConfig;
  export default config;
}

declare module "virtual:starlight/components/*" {
  const Component: (props: Record<string, unknown>) => unknown;
  export default Component;
}

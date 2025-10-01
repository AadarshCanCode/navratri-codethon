declare module '@supabase/ssr' {
  // Minimal typing for createServerClient used in this project. Use `any` for unknown internals.
  export function createServerClient(
    url: string,
    key: string,
    opts?: any,
  ): {
    auth: {
      getUser: () => Promise<any>
    }
    // allow any other properties
    [k: string]: any
  }

  export {}
}

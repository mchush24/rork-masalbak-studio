/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'redis' {
  export function createClient(options?: { url?: string }): any;
}

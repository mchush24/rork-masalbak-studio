/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'detox' {
  export const device: any;
  export const element: any;
  export const by: any;
  export const expect: any;
  export function waitFor(element: any): any;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Minimal fallback so `routeTree.gen.ts` typechecks before the Vite plugin regenerates it. */
export function createRouteTree(root: any, children: any[]): any {
  return root.addChildren(children);
}

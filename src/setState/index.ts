import React from "react";
/**
 * ok ... what you found here is a proposal for the implementation of an alternative
 * to redux and useReducer, also simplifying the API (or at least that's what I try),
 * its use is intended for small to medium applications, which is just a project to
 * test what you have learned about react.
 */


/**
 * Inject action in thunks
 * @param action associative array sync reducer
 * @param reducer associative array async reducer
 */
function createThunk(action:any,reducer:any){
  const result: any = {};

  /**
   * check every thunk
   */
  Object.keys(reducer).forEach((key) => {
    const value = reducer[key];

    const isFunc = typeof value === "function";
    const isObj = typeof value === "object";

    if (isFunc) {
      result[key] = (...args: any[]) => value.call(null, action, ...args);
    }

    if (isObj) {
      result[key] = createThunk(action, value);
    }
  });

  return result;
}

/**
 * Wrap action with setState
 * 
 * Warning!!! this is experimental
 *
 * @param setState react setState
 * @param sync associative array sync reducer
 * @param async associative array async reducer
 */
export function createAction<T, R>(setState: SetState<T>, reducer: R): Action<R, T>
export function createAction<T, R, A>(setState: SetState<T>, reducer: R,thunk:A):Actions<T,R,A>
export function createAction(setState: any, reducer: any, thunk?: any): any {
  const result: any = (cb: any) => setState((state: any) => cb(state) || state);

  result.getState = () => {
    return new Promise((res, rej) => {
      setState((state: any) => {
        res(state);
        return state;
      });
    });
  };

  Object.keys(reducer).forEach((key) => {
    const value = reducer[key];

    const isFunc = typeof value === "function";
    const isObj = typeof value === "object";

    if (isFunc) {
      result[key] = (...args: any[]) => {
        setState((state: any) => value.call(null, state, ...args) || state);
        return result;
      };
    } else if (isObj) {
      result[key] = createAction(setState, value);
    }
  });

  if (!thunk) {
    return result;
  }

  const resultT = createThunk(result, thunk);

  return [result, resultT];
}

export const useAction: Create = ((setState: any, reducer: any, thunk: any) => {
  return React.useMemo(() => {
    return createAction(setState, reducer, thunk);
  }, [setState, reducer, thunk]);
}) as any;

/**
 * Types
 */
type Create = typeof createAction;

type Actions<T,R,A> = [Action<R, T>,Thunk<A,Action<R, T>>];

type Thunk<T, A> = A extends Action<infer R, infer S>
  ? {
      [K in keyof T]: T[K] extends (
        action: Action<R, S>,
        ...args: infer E
      ) => infer F
        ? (...args: E) => F
        : T[K] extends {
            [K: string]:
              | ((action: Action<R, S>, ...args: any[]) => any)
              | { [K: string]: (action: Action<R, S>, ...args: any[]) => any };
          }
        ? Thunk<T[K], A>
        : never;
    }
  : never;

export type Action<T, S> = {
  readonly [K in keyof T]: T[K] extends (state: S, ...args: infer A) => S
    ? (...args: A) => Action<T, S>
    : T[K] extends {
        [K: string]:
          | ((state: S, ...args: any[]) => S)
          | {
              [K: string]:
                | ((state: S, ...args: any[]) => S)
                | { [K: string]: (state: S, ...args: any[]) => S };
            };
      }
    ? Action<T[K], S>
    : never;
} & { (cb: (state: S) => S | void): void; getState: () => Promise<S> };

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

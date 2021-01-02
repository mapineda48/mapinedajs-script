import React from "react";

/**
 * ok ... what you found here is a proposal for the implementation of an alternative
 * to redux and useReducer, also simplifying the API (or at least that's what I try),
 * its use is intended for small to medium applications, which is just a project to
 * test what you have learned about react.
 */


/**
 * Create Thunk
 * @param action associative array sync reducer
 * @param reducer associative array async reducer
 */
export const createThunk: CreateThunk = (action, reducer: any) => {
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
};

export const createAction: Create = ((
  setState: any,
  reducer: any,
  thunk: any
) => {
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
      result[key] = (createAction as any)(setState, value, result);
    }
  });

  if (thunk) {
    result.thunk = createThunk(result, thunk);
  }

  return result;
}) as any;


/**
 * Returns an action and thunk with memorized setState
 *
 * Warning!!! this is experimental
 *
 * @param setState setState is used as dispatch (redux inspiration)
 * @param reducer sync actions reducer statse
 * @param thunk async actions reducer state
 */
export const useAction: Create = ((setState: any, reducer: any, thunk: any) => {
  return React.useMemo(() => {
    return createAction(setState, reducer, thunk);
  }, [setState, reducer, thunk]);
}) as any;

export default useAction;

/**
 * Typings
 */
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

type Thunk<T, A> = A extends Action<infer R, infer S>
  ? {
      thunk: {
        [K in keyof T]: T[K] extends (
          action: Action<R, S>,
          ...args: infer E
        ) => infer F
          ? (...args: E) => F
          : T[K] extends {
              [K: string]: (
                action: Action<R, S>,
                ...args: any[]
              ) => any;
            }
          ? Thunk<T[K], A>
          : never;
      };
    }
  : never;

type CreateThunk = <A, T>(action: A, reducer: T) => Thunk<T, A>;

export interface Create {
  <T, R>(
    setState: React.Dispatch<React.SetStateAction<T>>,
    reducer: R
  ): Action<R, T>;
  <T, R, TH>(
    setState: React.Dispatch<React.SetStateAction<T>>,
    reducer: R,
    thunk: TH
  ): Action<R, T> & Thunk<TH, Action<R, T>>;
}

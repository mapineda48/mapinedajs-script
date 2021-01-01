import React from "react";

/**
 * ok ... what you found here is a proposal for the implementation of an alternative
 * to redux and useReducer, also simplifying the API (or at least that's what I try),
 * its use is intended for small to medium applications, which is just a project to
 * test what you have learned about react.
 */

export const createAction: CreateAction = ((
  setState: any,
  reducer: any,
  returnIt: any
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

  const _returnIt = returnIt || result;

  Object.keys(reducer).forEach((key) => {
    const value = reducer[key];

    const isFunc = typeof value === "function";
    const isObj = typeof value === "object";

    if (isFunc) {
      result[key] = (...args: any[]) => {
        setState((state: any) => value.call(null, state, ...args) || state);
        return _returnIt;
      };
    } else if (isObj) {
      result[key] = (createAction as any)(setState, value, result);
    }
  });

  return result;
}) as any;

export const createThunk: CreateThunk = (setState, action, reducer: any) => {
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
      result[key] = createThunk(setState, action, value);
    }
  });

  return result;
};

export const create: Create = ((setState: any, reducer: any, thunk: any) => {
  const action = createAction(setState, reducer);

  if (!thunk) {
    return action;
  }

  const asyncAction = createThunk(setState, action, thunk);

  return [action, asyncAction] as const;
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
    return create(setState, reducer, thunk);
  }, [setState, reducer, thunk]);
}) as any;

export default useAction;

/**
 * Typings
 */

export type Action<T, S, R = T> = {
  readonly [K in keyof T]: T[K] extends (state: S, ...args: infer A) => S
    ? (...args: A) => Action<R, S>
    : T[K] extends {
        [K: string]:
          | ((state: S, ...args: any[]) => S)
          | {
              [K: string]:
                | ((state: S, ...args: any[]) => S)
                | { [K: string]: (state: S, ...args: any[]) => S };
            };
      }
    ? Action<T[K], S, R>
    : never;
} & { (cb: (state: S) => S | void): void; getState: () => Promise<S> };

type Thunk<T, A> = A extends Action<infer R, infer S>
  ? {
      readonly [K in keyof T]: T[K] extends (
        action: Action<R, S>,
        ...args: infer E
      ) => Promise<infer F>
        ? (...args: E) => Promise<F>
        : T[K] extends {
            [K: string]: (action: Action<R, S>, ...args: any[]) => Promise<any>;
          }
        ? Thunk<T[K], A>
        : never;
    }
  : never;

type CreateAction = <T, R, A = Action<R, T>>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  reducer: R
) => A;

type CreateThunk = <A, T>(
  setState: React.Dispatch<React.SetStateAction<any>>,
  action: A,
  reducer: T
) => Thunk<T, A>;

export interface Create {
  <T, R, A = Action<R, T>>(
    setState: React.Dispatch<React.SetStateAction<T>>,
    reducer: R
  ): A;
  <T, R, TH, A = Action<R, T>>(
    setState: React.Dispatch<React.SetStateAction<T>>,
    reducer: R,
    thunk: TH
  ): [A, Thunk<TH, A>];
}
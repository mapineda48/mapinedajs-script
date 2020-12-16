import React from "react";

/**
 * Warning that this is experimental
 */

const createAction: Create = (setState, reducer: any) => {
  const result: any = {};

  Object.keys(reducer).forEach((key) => {
    const value: Function = reducer[key];

    if (typeof value !== "function") return;

    result[key] = (...args: any[]) => {
      return setState((state) => value.call(null, state, ...args) || state);
    };
  });

  return result;
};

const createThunk: CreateThunk = (setState, action, reducer: any) => {
  const result: any = {};

  /**
   * check every thunk
   */
  Object.keys(reducer).forEach((key) => {
    const value: Function = reducer[key];

    if (typeof value !== "function") return;

    result[key] = (...args: any[]) =>
      /**
       *setState is async, create Promise to handler the result and error of current thunk
       */
      new Promise((res, rej) => {
        setState((state: any) => {
          /**
           * maybe i should check if the current function is a promise, it's possible crash here
           */
          try {
            value
              .call(null, action, state, ...args)
              .then(res)
              .catch(rej);
          } catch (error) {
            rej(error);
          }

          return state;
        });
      });
  });

  return result;
};

export const useThunk: CreateThunk = (setState, action, reducer) => {
  return React.useMemo(() => createThunk(setState, action, reducer), [
    setState,
    action,
    reducer,
  ]);
};

export const useAction: Create = (setState, reducer) => {
  return React.useMemo(() => createAction(setState, reducer), [
    setState,
    reducer,
  ]);
};

export default useAction;

/**
 * Typings
 */

type Action<T, S> = {
  readonly [K in keyof T]: T[K] extends (state: S, ...args: infer A) => S
    ? (...args: A) => void
    : never;
};

type Thunk<T, A> = A extends Action<infer R, infer S>
  ? {
      [K in keyof T]: T[K] extends (
        action: Action<R, S>,
        state: S,
        ...args: infer E
      ) => Promise<infer F>
        ? (...args: E) => Promise<F>
        : never;
    }
  : never;

type Create = <T, R>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  reducer: R
) => Action<R, T>;

type CreateThunk = <A, T>(
  setState: React.Dispatch<React.SetStateAction<any>>,
  action: A,
  reducer: T
) => Thunk<T, A>;

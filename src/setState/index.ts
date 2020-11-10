import React from "react";

  /**
   * Warning that this is experimental
   */

const createAction: Create = (setState, reducer: any) => {
  /**
   * it is possible to lose the current state
   */
  function getState(): any {
    return new Promise((resolve, reject) => {
      setState((state) => {
        resolve(state);
        return state;
      });
    });
  }

  const result: any = { getState };

  Object.keys(reducer).forEach((key) => {
    const value: Function = reducer[key];

    if (typeof value !== "function") return;

    result[key] = (...args: any[]) => {
      return setState((state) => value.call(null, state, ...args) || state);
    };
  });

  return result;
};

const createThunk: CreateThunk = (action, reducer: any) => {
  const result: any = {};

  Object.keys(reducer).forEach((key) => {
    const value: Function = reducer[key];

    if (typeof value !== "function") return;

    result[key] = (...args: any[]) => value.call(null, action, ...args);
  });

  return result;
};

export const useThunk: CreateThunk = (action, reducer) => {
  return React.useMemo(() => createThunk(action, reducer), [action, reducer]);
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
} & {
  readonly getState: () => Promise<S>;
};

type Thunk<T, A> = {
  readonly [K in keyof T]: T[K] extends (
    action: A,
    ...args: infer A
  ) => Promise<infer B>
    ? (...args: A) => Promise<B>
    : never;
};

type Create = <T, R>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  reducer: R
) => Action<R, T>;

type CreateThunk = <A, T>(action: A, reducer: T) => Thunk<T, A>;

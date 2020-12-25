import * as type from "./type";
import { State } from ".";
import { Colombia, Record } from "./sigma";

export function loading(state: State): State {
  return { ...state, isLoading: true };
}

export function notify(state: State, message: string): State {
  return { ...state, isLoading: false, message };
}

export function colombia(state: State, colombia: Colombia): State {
  return {
    ...state,
    view: type.HOME,
    isLoading: false,
    colombia: { ...colombia },
  };
}

export const foo = {
  loading(state: State): State {
    return state;
  },
  bar: {
    loading(state: State): State {
      return state;
    },
    baz: {
      foo(state: State): State {
        return state;
      },
    },
  },
};

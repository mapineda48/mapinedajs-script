import React from "react";
import useAction from "..";
import * as reducer from "./reducer";
import * as reducerAsync from "./thunk";
import { Colombia, Record } from "./sigma";
import * as type from "./type";

function createPerson(): Record {
  return {
    id: 0,
    full_name: "",
    department: "",
    city: "",
    email: "",
  };
}

function create(): State {
  return {
    view: type.WELCOME,
    colombia: null as any,
    isLoading: false,
    message: "",
  };
}

export function useSigmaRoot() {
  const [state, setState] = React.useState(create);

  const [sigma, thunk] = useAction(setState, reducer, reducerAsync);

  if (!state.colombia && !state.isLoading) {
    thunk.fetchColombia();
  }

  return [state, sigma, thunk] as const;
}

const value: any = null;

export const Context = React.createContext<Sigma>(value);

export function useSigma() {
  return React.useContext(Context);
}

export { type };

/**
 * Types
 */
type View = typeof type[keyof typeof type];

export interface State {
  view: View;
  isLoading: boolean;
  message: string;
  colombia: Colombia;
}

export type Sigma = ReturnType<typeof useSigmaRoot>;

export type Action = Sigma[1];

interface Props {
  children: React.ReactNode;
}

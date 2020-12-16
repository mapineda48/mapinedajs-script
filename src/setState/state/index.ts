import React from "react";
import { useAction, useThunk } from "..";
import * as reducer from "./reducer";
import * as thunk from "./thunk";
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

  const sigma = useAction(setState, reducer);

  const _thunk = useThunk(setState, sigma, thunk);

  if (!state.colombia && !state.isLoading) {
    _thunk.fetchColombia();
  }

  return [state, sigma, _thunk] as const;
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

import * as query from "./sigma";
import { State, Action } from ".";

const foo = () => {
  return new Promise<any>((res, rej) => {
    setTimeout(() => {
      res({ foo: "bar" });
    }, 2000);
  });
};

export async function fetchColombia(sigma: Action, state: State) {
  if (state.isLoading) return;

  sigma.loading();
  try {
    const colombia = await foo();
    sigma.colombia(colombia);
  } catch (error) {
    sigma.notify(error.message);
  }
}

export const bar = {
  fetch(sigma: Action, state: State) {
    return Promise.resolve();
  },
};

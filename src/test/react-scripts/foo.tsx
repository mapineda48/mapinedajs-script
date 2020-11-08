import React from "react";
import ReactDOM from "react-dom";
import type { Foo } from "./foo";

function HelloWorld() {
  const foo: Foo = {
    bar: "",
  };

  return <div>Hello foo!!!</div>;
}

ReactDOM.render(
  <React.StrictMode>
    <HelloWorld />
  </React.StrictMode>,
  document.getElementById("root")
);

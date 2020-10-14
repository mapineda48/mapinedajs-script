import React from "react";
import ReactDOM from "react-dom";

function HelloWorld() {
  return <div>Hello World!!!</div>;
}

ReactDOM.render(
  <React.StrictMode>
    <HelloWorld />
  </React.StrictMode>,
  document.getElementById("root")
);

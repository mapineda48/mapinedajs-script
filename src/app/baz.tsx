import React from "react";
import ReactDOM from "react-dom";

function App() {
  return <div>Hello World from baz!!!</div>;
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

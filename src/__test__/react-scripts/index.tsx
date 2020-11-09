import React from "react";
import ReactDOM from "react-dom";

import style from "./index.module.scss";

function HelloWorld() {
  return <div className={style._}>Hello World!!!</div>;
}

ReactDOM.render(
  <React.StrictMode>
    <HelloWorld />
  </React.StrictMode>,
  document.getElementById("root")
);

import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./tic.tsx";
import i18n from "./assets/lang";
import Main from "./main";
import { I18nextProvider } from "react-i18next";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <I18nextProvider i18n={i18n}>
    <React.StrictMode>
      {/* <App /> */}

      <Main />
    </React.StrictMode>
  </I18nextProvider>
);

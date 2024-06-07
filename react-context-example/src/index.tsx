import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { registerFlipperContextApiHelper } from "react-context-api-flipper-plugin";

import { CommonContextProvider } from "./context";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

registerFlipperContextApiHelper()

root.render(
	<React.Fragment>
		<CommonContextProvider>
			<App />
		</CommonContextProvider>
	</React.Fragment>
);



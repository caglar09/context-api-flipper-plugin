import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { registerFlipperContextApiHelper } from "react-context-api-flipper-plugin";

import { CommonContextProvider, TestContextProvider } from "./context";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

registerFlipperContextApiHelper(() =>
	root.render(
		<React.Fragment>
			<TestContextProvider>
				<CommonContextProvider name="CommonContext">
					<App />
				</CommonContextProvider>
			</TestContextProvider>
		</React.Fragment>
	)
);

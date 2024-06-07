import { createRef } from "react";
import { ContextApiEventManager } from "./flipper-plugin";
import { FlipperConnection } from "./type";

let contextApiWatcherInstance: ContextApiEventManager | null = null;
export let flipperConnectionRef = createRef<FlipperConnection>();
export const getFlipperContextApiHelper = () => {
	if (contextApiWatcherInstance) {
		console.log("FLIPPER-CONTEXT-API-HANDLER", contextApiWatcherInstance);

		return contextApiWatcherInstance;
	}
	return null; // Or a dummy object
};

export const registerFlipperContextApiHelper = async (
	renderRoot?: Function
) => {
	const pluginData = {
		getId: () => "context-api-watcher",
		onConnect: (connection: any) => {
			// contextApiWatcherInstance = new ContextApiEventManager(connection);
			// @ts-ignore
			flipperConnectionRef.current = connection;
		},
		onDisconnect: () => {
			// @ts-ignore
			flipperConnectionRef.current = null;
		},
	};

	try {
		const importPromise = require("js-flipper")
			? import("js-flipper").then(({ flipperClient }) => {
					flipperClient.start(pluginData.getId());
					flipperClient.addPlugin(pluginData);
					return Promise.resolve(flipperClient);
			  })
			: // @ts-ignore
			  import("react-native-flipper").then(({ addPlugin }) => {
					addPlugin(pluginData);
					return Promise.resolve({
						addPlugin,
					});
			  });

		importPromise.then(() => {
			console.log("FLIPPER-REGISTERED");
			setTimeout(() => {
				renderRoot?.();
			}, 5000);
		});
	} catch (error) {
		console.error("Failed to register:", error);
	} finally {
	}
};

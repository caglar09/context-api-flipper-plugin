import { createRef } from "react";
import { ContextApiEventManager } from "./flipper-plugin";
import { FlipperConnection } from "./type";

export let flipperConnectionRef = createRef<FlipperConnection>();

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
			}, 2000);
		});
	} catch (error) {
		console.error("Failed to register:", error);
	} finally {
	}
};

import { FlipperContextApiHelper } from "./flipper-plugin";

let contextApiWatcherInstance: FlipperContextApiHelper | null = null;

const isFlipperAvailable = () => {
	try {
		return !!require("js-flipper") || !!require("react-native-flipper");
	} catch (error) {
		console.error("Failed to check for Flipper library:", error);
		return false;
	}
};

export const getFlipperContextApiHelper = () => {
	if (contextApiWatcherInstance) {
		console.log("FLIPPER-CONTEXT-API-HANDLER", contextApiWatcherInstance);

		return contextApiWatcherInstance;
	}
	return null; // Or a dummy object
};

export const registerFlipperContextApiHelper = async () => {
	const pluginData = {
		getId: () => "context-api-watcher",
		onConnect: (connection: any) => {
			contextApiWatcherInstance = new FlipperContextApiHelper(connection);
		},
		onDisconnect: () => {
			contextApiWatcherInstance?.disconnect();
			contextApiWatcherInstance = null;
		},
	};

	try {
		const importPromise = require("js-flipper")
			? import("js-flipper").then(({ flipperClient }) => {
					flipperClient.start(pluginData.getId());
					flipperClient.addPlugin(pluginData);
			  })
			: import("react-native-flipper").then(({ addPlugin }) => {
					addPlugin(pluginData);
			  });

		await importPromise;

		console.log("FLIPPER-CONNECTED");
	} catch (error) {
		console.error("Failed to register:", error);
	}
};

import { createRef, useRef } from "react";
import { addPlugin, Flipper } from "react-native-flipper";
import { ReducerAction } from "../core/types";

export class ContextApiEventManager {
	private connectionRef: Flipper.FlipperConnection | null;
	private contextName: string;

	constructor(
		ref: Flipper.FlipperConnection | null,
		contextName: string,
		initialState: any
	) {
		this.connectionRef = ref;
		this.contextName = contextName;

		this.register(initialState);
	}

	private register = (initialState: any) => {
		if (this.connectionRef) {
			this.connectionRef.send("contextRegistered", {
				name: this.contextName,
				initialState,
			});
		}
	};

	unregister = () => {
		if (this.connectionRef) {
			this.connectionRef.send("contextUnregistered", {
				name: this.contextName,
			});
		}
	};

	sendEvent = (action: ReducerAction) => {
		if (this.connectionRef) {
			this.connectionRef.send("contextEvent", {
				name: this.contextName,
				type: action.type,
				payload: action.payload,
			});
		}
	};
	setState = (state: any) => {
		if (this.connectionRef) {
			this.connectionRef.send("contextUpdateState", {
				name: this.contextName,
				state,
			});
		}
	};
}

export class ContextApiWatchHelper {
	connectionRef: Flipper.FlipperConnection | null;

	constructor(ref: Flipper.FlipperConnection | null) {
		this.connectionRef = ref;
	}

	registerContext = (contextName: string, initialState: any) => {
		const eventManager = new ContextApiEventManager(
			this.connectionRef,
			contextName,
			initialState
		);

		return eventManager;
	};

	disconnect = () => {
		this.connectionRef = null;
	};
}

let contextApiWatcherInstance: ContextApiWatchHelper = null;

export const getContextApiWatcher = () => {
	// if (!contextApiWatcherInstance) {
	// 	throw new Error(
	// 		"Context API Watcher is not connected or not registered. Please call registerFlipperContextApiWatcher() first."
	// 	);
	// }
	return contextApiWatcherInstance;
};

export const registerFlipperContextApiWatcher = () => {
	addPlugin({
		getId: () => "context-api-watcher",
		onConnect: (connection) => {
			contextApiWatcherInstance = new ContextApiWatchHelper(connection);
		},
		onDisconnect: () => {
			contextApiWatcherInstance?.disconnect();
			contextApiWatcherInstance = null;
		},
	});
};

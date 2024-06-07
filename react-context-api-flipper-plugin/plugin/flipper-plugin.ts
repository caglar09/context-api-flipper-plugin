import { addPlugin, Flipper } from "react-native-flipper";

export type ContextApiEventTypes = "initialState" | "setState" | "dispatch";

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

	sendEvent = (type: ContextApiEventTypes, data: any) => {
		if (this.connectionRef) {
			this.connectionRef.send("contextEvent", {
				name: this.contextName,
				type,
				data,
			});
		}
	};
}

export class FlipperContextApiHelper {
	private registeredContexts: { [key: string]: ContextApiEventManager } = {};
	private connectionRef: Flipper.FlipperConnection | null;

	constructor(ref: Flipper.FlipperConnection | null) {
		this.connectionRef = ref;
	}

	registerContext = (contextName: string, initialState: any) => {
		if (this.registeredContexts[contextName]) {
			console.log("Context already registered:", contextName);
			return this.registeredContexts[contextName];
		}

		const eventManager = new ContextApiEventManager(
			this.connectionRef,
			contextName,
			initialState
		);

		this.registeredContexts[contextName] = eventManager;

		return eventManager;
	};

	disconnect = () => {
		this.connectionRef = null;
		this.registeredContexts = {};
	};
}

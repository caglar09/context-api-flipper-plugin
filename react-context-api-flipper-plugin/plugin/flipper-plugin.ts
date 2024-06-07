import { flipperConnectionRef } from "./register";
export type ContextApiEventTypes = "initialState" | "setState" | "dispatch";

export class ContextApiEventManager {
	contextName: string = "";
	private isRegistered = false;

	register = (contextName: string) => {
		if (flipperConnectionRef.current) {
			this.contextName = contextName;
			flipperConnectionRef.current.send("contextRegistered", {
				name: this.contextName,
				time: new Date().getTime(),
			});
			this.isRegistered = true;
		}
	};

	unregister = () => {
		if (flipperConnectionRef.current) {
			flipperConnectionRef.current.send("contextUnregistered", {
				name: this.contextName,
				time: new Date().getTime(),
			});
			this.isRegistered = false;
		}
	};

	sendEvent = (type: ContextApiEventTypes, data: any) => {
		if (flipperConnectionRef.current) {
			if (!this.isRegistered && this.contextName !== "") {
				console.error("Please the register context");
				this.register(this.contextName);
				return;
			}
			flipperConnectionRef.current.send("contextEvent", {
				name: this.contextName,
				time: new Date().getTime(),
				type,
				data,
			});
		}
	};
}

// export class FlipperContextApiHelper {
// 	private registeredContexts: { [key: string]: ContextApiEventManager } = {};
// 	private connectionRef: FlipperConnection | null;

// 	constructor(ref: FlipperConnection | null) {
// 		this.connectionRef = ref;
// 	}

// 	registerContext = (contextName: string, initialState: any) => {
// 		if (this.registeredContexts[contextName]) {
// 			console.log("Context already registered:", contextName);
// 			return this.registeredContexts[contextName];
// 		}

// 		const eventManager = new ContextApiEventManager(
// 			this.connectionRef,
// 			contextName,
// 			initialState
// 		);

// 		this.registeredContexts[contextName] = eventManager;

// 		return eventManager;
// 	};

// 	disconnect = () => {
// 		this.connectionRef = null;
// 		this.registeredContexts = {};
// 	};
// }

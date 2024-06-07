import React from "react";
import {
	PluginClient,
	usePlugin,
	createState,
	useValue,
	Layout,
} from "flipper-plugin";

// import the react-json-view component
import ReactJson from "react-json-view";

type UIContextData = {
	name: string;
	state: any;
	history: ContextEvent[];
};

type Data = {
	contexts: Record<string, UIContextData>;
};

type ContextRegisterPayload = {
	name: string;
};
type ContextEvent = ContextRegisterPayload & {
	type: string;
	payload: any;
};

type Events = {
	contextRegistered: ContextRegisterPayload;
	contextUnregistered: ContextRegisterPayload;
	contextEvent: ContextEvent;
	contextUpdateState: ContextRegisterPayload & { state: any };
};

// Read more: https://fbflipper.com/docs/tutorial/js-custom#creating-a-first-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#pluginclient
export function plugin(client: PluginClient<Events, {}>) {
	const data = createState<Data>(
		{
			contexts: {},
		},
		{ persist: "data" }
	);

	client.onMessage("contextRegistered", (contextData) => {
		data.update((draft) => {
			console.log("contextData", contextData);

			draft.contexts[contextData.name] = {
				name: contextData.name,
				state: {},
				history: [],
			};
		});
	});

	client.onMessage("contextUnregistered", (contextData) => {
		data.update((draft) => {
			delete draft.contexts[contextData.name];
		});
	});

	client.onMessage("contextEvent", (contextData) => {
		data.update((draft) => {
			console.log("contextEvent", contextData);

			draft.contexts[contextData.name].history.push(contextData);
		});
	});

	client.onMessage("contextUpdateState", (contextData) => {
		data.update((draft) => {
			draft.contexts[contextData.name].state = contextData.state;
		});
	});

	return { data };
}

// Read more: https://fbflipper.com/docs/tutorial/js-custom#building-a-user-interface-for-the-plugin
// API: https://fbflipper.com/docs/extending/flipper-plugin#react-hooks
export function Component() {
	const instance = usePlugin(plugin);
	const data = useValue(instance.data);

	return (
		// @ts-ignore
		<Layout.ScrollContainer>
			<>
				<ReactJson src={data} />
				{/* {Object.entries(data).map(([id, d]) => (
					<pre key={id} data-testid={id}>
						{JSON.stringify(d, null, 4)}
					</pre>
				))} */}
			</>
		</Layout.ScrollContainer>
	);
}

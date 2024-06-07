import {
	ReducerAction,
	createCustomDataContextV2,
} from "react-context-api-helper";

import { ContextApiEventManager } from "react-context-api-flipper-plugin";

const initialState = {
	initialized: false,
	count: 0,
};

const reducer = (state: typeof initialState, action: ReducerAction) =>
	({
		INITIALIZE: {
			...state,
			initialized: action.payload,
		},
		INCREMENT: {
			...state,
			count: state.count + 1,
		},
		DECREMENT: {
			...state,
			count: state.count - 1,
		},
	}[action.type]);

export const {
	Context: CommonContext,
	Provider: CommonContextProvider,
	useContext: useCommonContext,
} = createCustomDataContextV2(
	{
		initialState,
		reducer,
		devSettings: {
			logsEnabled: false,
		},
		actions: (dispatch) => ({
			setInitialized: (value: boolean) => {
				dispatch({ type: "INITIALIZE", payload: value });
			},
			increment: () => {
				dispatch({ type: "INCREMENT", payload: true });
			},
			decrement: () => {
				dispatch({ type: "DECREMENT", payload: true });
			},
		}),
	},
	() => {
		const eventHandler = new ContextApiEventManager();
		return {
			onRegister: (name) => {
				eventHandler?.register(name);
			},
			onEvent: (name, data) => {
				eventHandler?.sendEvent?.(name, data);
			},
			onUnRegister: () => {
				eventHandler?.unregister?.();
			},
		};
	}
);

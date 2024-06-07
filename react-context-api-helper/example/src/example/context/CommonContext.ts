import { createCustomDataContextV2 } from "react-context-api-helper/src/context/createDataContextV2";
import { ReducerAction } from "react-context-api-helper/src/core";
const initialState = {
	initialized: false,
};

const reducer = (state: typeof initialState, action: ReducerAction) =>
	({
		INITIALIZE: {
			...state,
			initialized: action.payload,
		},
	})[action.type];

export const {
	Context: CommonContext,
	Provider: CommonContextProvider,
	useContext: useCommonContext,
} = createCustomDataContextV2(
	{
		initialState,
		reducer,
		devSettings: {
			logsEnabled: true,
		},
		actions: (dispatch, getters) => ({
			setInitialized: (value: boolean) => {
				dispatch({ type: "INITIALIZE", payload: value });
			},
		}),
	},
	(contextName) => {
		return {
			onEvent: (name, data) => {},
			onUnRegister: () => {},
		};
	}
);

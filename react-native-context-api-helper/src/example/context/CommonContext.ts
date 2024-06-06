import { createCustomDataContextV2 } from "../../context/createDataContextV2";

const initialState = {
	initialized: false,
};

const reducer = (
	state: typeof initialState,
	action: { type: string; payload: any }
) => {
	switch (action.type) {
		case "INITIALIZE":
			return {
				...state,
				initialized: action.payload,
			};
	}
};

export const {
	Context: CommonContext,
	Provider: CommonContextProvider,
	useContext: useCommonContext,
} = createCustomDataContextV2({
	initialState,
	reducer,
	actions: (dispatch, getters) => ({
		setInitialized: (value: boolean) => {
			dispatch({ type: "INITIALIZE", payload: value });
		},
	}),
});

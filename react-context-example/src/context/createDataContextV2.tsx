import React, {
	Context,
	createContext,
	Dispatch,
	memo,
	useEffect,
	useMemo,
	useReducer,
	useRef,
} from "react";

import {
	GetReturnType,
	GetterProperty,
	ReducerAction,
	ReducerActionType,
} from "../core/types";
import { ContextHelper } from "../core";

// Define the type for the initial state
export interface InitialStateType {
	readonly [key: string]: any;
}

// Define the type for the context action function
export type ContextAction<T extends any[] = any[]> = (
	...args: T
) => void | GetReturnType<any>;

// Define the type for the context action function with dispatch
export type ContextActionType<T extends any[] = any[]> = (
	dispatch: Dispatch<ReducerAction>
) => ContextAction<T>;

export interface IContext<TState extends Record<string, any>> {
	initialState: TState;
	reducer: ReducerActionType<TState, Partial<TState>>;
	// reducer: (
	// 	state: TState
	// ) => Record<string, (...args: any[]) => Partial<TState>>;
	actions: (
		dispatch: Dispatch<ReducerAction>,
		getters: {
			getState: () => TState;
			getIntialState: () => TState;
		}
	) => Record<string, ContextAction<any>>;

	devSettings?: {
		logsEnabled?: boolean;
	};
}

type ContextEventHandlerTypes = "setState" | "initialState" | "dispatch";

function createCustomDataContextV2<
	Context extends IContext<any> = IContext<any>
>(
	context: Context,
	getEventHandler: () => {
		onRegister?: (name: string) => void;
		onUnRegister?: (name?: string) => void;
		onEvent?: (name: ContextEventHandlerTypes, data?: any) => void;
	} = () => ({})
) {
	const uniqueContextName = ContextHelper.generateContextName();

	type CurrentContextType = typeof context;

	type ContextActionTypes = ReturnType<CurrentContextType["actions"]>;
	type StateType = GetterProperty<CurrentContextType["initialState"]>;

	type ContextType = ContextActionTypes & {
		state: GetterProperty<CurrentContextType["initialState"]>;
		name?: string;
	};

	const contextInitialState = {
		state: context.initialState,
	} as ContextType;

	// Create the context
	const MyContext = createContext<ContextType>(contextInitialState);
	const eventHandler = getEventHandler ? getEventHandler() : null;

	/**
	 * The provider component that wraps the children components with the context.
	 * @param children The children components to be wrapped.
	 * @param name The display name of the context.
	 * @returns The provider component.
	 */
	const ProviderComp = ({
		children,
		name,
		value,
	}: {
		children: React.JSX.Element | any;
		name?: string;
		value?:
			| ((initialState: StateType) => {
					[key in keyof StateType]?: GetReturnType<StateType[key]>;
			  })
			| { [key in keyof StateType]?: GetReturnType<StateType[key]> };
	}) => {
		MyContext.displayName = name ?? uniqueContextName;
console.log(eventHandler);

		const reducerMiddleware = (state: StateType, action: ReducerAction) => {
			const preparedState = context.reducer(state, action);

			if (context.devSettings?.logsEnabled) {
				console.log(
					"[CONTEXT-REDUCER-EVENT]",
					action.type,
					JSON.stringify(action.payload)
				);
			}
			eventHandler?.onEvent?.("dispatch", action);
			eventHandler?.onEvent?.("setState", preparedState);

			return preparedState as StateType;
		};

		const [state, dispatch] = useReducer<
			ReducerActionType<StateType>,
			StateType
		>(reducerMiddleware, context.initialState, (st: StateType) => {
			let _value = {};
			if (value && typeof value === "function") {
				_value = { ...value(st) };
			}
			if (value && typeof value === "object") {
				_value = { ...value };
			}
			let _initialState = { ...st, ..._value };

			return _initialState;
		});

		// const customDispatcher: typeof dispatch = (action: ReducerAction) => {
		// 	dispatch(action);
		// };

		const contextActions = useMemo(
			() =>
				context.actions(dispatch, {
					getState: () => state,
					getIntialState: () => context.initialState,
				}),
			[dispatch, state]
		);

		const contextValue: ContextType = useMemo(
			() =>
				({
					state,
					name: MyContext.displayName,
					...contextActions,
				} as ContextType),
			[state, contextActions]
		);

		useEffect(() => {
			eventHandler?.onRegister?.(MyContext.displayName ?? "");
			eventHandler?.onEvent?.("initialState", context.initialState);

			return () => {
				eventHandler?.onUnRegister?.(MyContext.displayName);
			};
		}, []);

		return (
			<MyContext.Provider value={contextValue}>{children}</MyContext.Provider>
		);
	};

	// Return useContext hook
	const useContext = (): ContextType => {
		const context = React.useContext<ContextType>(MyContext);
		if (!context) {
			throw new Error("useContext must be used within a Provider");
		}
		return context;
	};

	const Provider = memo(ProviderComp);

	return { Context: MyContext, Provider, useContext };
}

// Define the type for the data context
export type DataContextType<T extends Context<any>> = React.ContextType<T>;
export { createCustomDataContextV2 };

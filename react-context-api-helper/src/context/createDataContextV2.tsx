import React, {
	Context,
	createContext,
	Dispatch,
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
	Context extends IContext<any> = IContext<any>,
>(
	context: Context,
	handleEventHandler?: (name: string) => {
		onUnRegister?: (name?: string) => void;
		onEvent?: (name: ContextEventHandlerTypes, data?: any) => void;
	}
) {
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
	const Context = createContext<ContextType>(contextInitialState);

	/**
	 * The provider component that wraps the children components with the context.
	 * @param children The children components to be wrapped.
	 * @param name The display name of the context.
	 * @returns The provider component.
	 */
	const Provider = ({
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
		Context.displayName = name ?? ContextHelper.generateContextName();

		const eventHandler = useRef<ReturnType<typeof handleEventHandler> | null>(
			handleEventHandler ? handleEventHandler(Context.displayName) : null
		);

		const reducerMiddleware = (state: StateType, action: ReducerAction) => {
			const preparedState = context.reducer(state, action);

			if (context.devSettings?.logsEnabled) {
				console.log(
					"[CONTEXT-REDUCER-EVENT]",
					action.type,
					JSON.stringify(action.payload)
				);
			}
			eventHandler?.current.onEvent?.("dispatch", action);
			eventHandler?.current.onEvent?.("setState", preparedState);

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

			eventHandler?.current.onEvent?.("initialState", _initialState);

			return _initialState;
		});

		const customDispatcher: typeof dispatch = (action: ReducerAction) => {
			dispatch(action);
		};

		const contextActions = context.actions(customDispatcher, {
			getState: () => state as StateType,
			getIntialState: () => context.initialState,
		});

		const contextValue: ContextType = {
			state,
			name: Context.displayName,
			...contextActions,
		} as ContextType;

		useEffect(() => {
			return () => {
				eventHandler?.current.onUnRegister?.(Context.displayName);
			};
		}, []);

		return <Context.Provider value={contextValue}>{children}</Context.Provider>;
	};

	// Return useContext hook
	const useContext = (): ContextType => {
		const context = React.useContext<ContextType>(Context);
		if (!context) {
			throw new Error("useContext must be used within a Provider");
		}
		return context;
	};

	return { Context, Provider, useContext };
}

// Define the type for the data context
export type DataContextType<T extends Context<any>> = React.ContextType<T>;
export { createCustomDataContextV2 };

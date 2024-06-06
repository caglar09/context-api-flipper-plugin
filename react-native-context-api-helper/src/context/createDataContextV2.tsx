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
import { ContextApiEventManager, getContextApiWatcher } from "../flipper";

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

// Define the type for the bound actions

export interface IContext<TState extends Record<string, any>> {
	initialState: TState;
	reducer: ReducerActionType<TState>;
	actions: (
		dispatch: Dispatch<ReducerAction>,
		getters: {
			getState: () => Readonly<TState>;
		}
	) => Record<string, ContextAction<any>>;

	devSettings?: {
		flipperDebug?: boolean;
	};
}

let contextCount: number = 0;

function createCustomDataContextV2<CTX extends IContext<any> = IContext<any>>(
	context: CTX
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
		Context.displayName = name ?? `Context${contextCount++}`;
		const contextHelper = useRef<ContextApiEventManager | null>(null);
		const [state, dispatch] = useReducer<
			ReducerActionType<StateType>,
			StateType
		>(context.reducer, context.initialState, (st: StateType) => {
			if (typeof value === "function") {
				return { ...st, ...value(st) };
			}
			if (value) {
				return { ...st, ...value };
			}
			return st;
		});

		const contextActions = context.actions(dispatch, {
			getState: () => state,
		});

		const contextValue: ContextType = {
			state,
			name: Context.displayName,
			...contextActions,
		} as ContextType;

		useEffect(() => {
			let _contextHelper = null;
			if (context.devSettings?.flipperDebug) {
				let cName = Context.displayName ?? name ?? "";
				_contextHelper = getContextApiWatcher().registerContext(cName, state);
			}
			contextHelper.current = _contextHelper;
			return () => {
				_contextHelper?.unregister?.();
			};
		}, []);
		useEffect(() => {
			if (context.devSettings?.flipperDebug) {
				contextHelper.current?.setState?.(state);
			}
		}, [state]);

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

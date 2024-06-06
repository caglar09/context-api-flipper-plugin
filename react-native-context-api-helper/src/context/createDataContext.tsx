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
	[key: string]: GetReturnType<any>;
}

// Define the type for the context action function
export type ContextAction<T extends any[] = any[]> = (
	...args: T
) => GetReturnType<any>;

// Define the type for the context action function with dispatch
export type ContextActionType<T extends any[] = any[]> = (
	dispatch: Dispatch<ReducerAction>
) => ContextAction<T>;

// Define the type for the bound actions
export type BoundActions<TActions> = {
	[key in keyof TActions]: ContextActionType;
};
// export type BoundActions = { [key in string]: ContextActionType<GetReturnType<any>> };

export interface IContext<TState> {
	initialState: TState;
	reducer: ReducerActionType<TState>;
	actions: Record<string, ContextActionType>;

	devSettings?: {
		flipperDebug?: boolean;
	};
}

let contextCount: number = 0;

function createCustomDataContext<State extends InitialStateType>(
	context: IContext<State>,
	callback?: (_actions: State["actions"]) => void
) {
	type CurrentContextType = typeof context;

	type ContextActionTypes = GetterProperty<CurrentContextType["actions"]>;
	type StateType = GetterProperty<CurrentContextType["initialState"]>;

	type ContextActions = {
		[key in keyof ContextActionTypes]: GetReturnType<ContextActionTypes[key]>;
	};

	type ContextType = { state: StateType; name?: string } & ContextActions;
	const contextInitialState = { state: context.initialState } as ContextType;

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
		children: React.JSX.Element;
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
		>(
			context.reducer,
			context.initialState,
			// @ts-ignore
			(st: StateType) => {
				if (typeof value === "function") {
					return { ...st, ...value(st) };
				}
				if (value) {
					return { ...st, ...value };
				}
				return st;
			}
		);

		const customDispatcher: typeof dispatch = (action: ReducerAction) => {
			dispatch(action);

			if (context.devSettings?.flipperDebug) {
				console.log(action);
				contextHelper.current.sendEvent(action);
			}
		};

		const memoizedActions = useMemo(() => context.actions, [context.actions]);
		// burada state'i dependency olarak eklemek gerekiyor. o yüzden önceki yapıda (dispatch,state) kullanımı kaldırıldı.
		const contextActions = useMemo<ContextActions>(() => {
			const bindedActions: ContextActions = {} as ContextActions;

			const actionKeys: (keyof ContextActionTypes)[] =
				Object.keys(memoizedActions);
			for (let i = 0; i < actionKeys.length; i++) {
				const key = actionKeys[i];
				bindedActions[key] = memoizedActions[key as keyof ContextActionTypes](
					customDispatcher
				) as GetReturnType<ContextActionTypes[typeof key]>;
			}
			return bindedActions;
		}, [memoizedActions]);

		// @ts-ignore
		const contextValue: ContextType = {
			state,
			name: Context.displayName,
			...contextActions,
		};

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
	const useContext = () => {
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
export { createCustomDataContext };

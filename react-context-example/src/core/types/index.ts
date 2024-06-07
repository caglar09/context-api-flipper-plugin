import { Reducer } from "react";

// Define a type to get the return type of a function
export type GetReturnType<Type> = Type extends (
	...args: never[]
) => infer Return
	? Return
	: never;

// Define a type to get the properties of an object with their types
export type Getters<Type> = {
	[Property in keyof Type]: GetReturnType<Type[Property]>;
};

// Define a type to get the properties of an object
export type GetterProperty<Type> = {
	[Property in keyof Type]: Type[Property];
};

// Define the type for the action in the reducer
export type ReducerAction<P extends any = any> = {
	type: string;
	payload: P;
};

// Define the type for the reducer function
export type ReducerActionType<T, P extends any = any> = Reducer<T, ReducerAction<P>>;

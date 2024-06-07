import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useCommonContext } from "./context";

const Page = () => {
	const commonConext = useCommonContext();
	console.log("page-rendered", commonConext);

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<TouchableOpacity onPress={commonConext.increment}>
				<Text>Increment</Text>
			</TouchableOpacity>
			<Text>{commonConext.state.count}</Text>
			<TouchableOpacity onPress={commonConext.decrement}>
				<Text>Decrement</Text>
			</TouchableOpacity>
		</View>
	);
};

export { Page };

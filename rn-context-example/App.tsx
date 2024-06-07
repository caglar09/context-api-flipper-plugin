import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { registerFlipperContextApiHelper } from "react-context-api-flipper-plugin";
import { Page, CommonContextProvider, TestContextProvider } from "./app/index";
import { useEffect, useState } from "react";

export default function App() {
	const [initialized, setInitialized] = useState(false);
	useEffect(() => {
		registerFlipperContextApiHelper(() => {
			setInitialized(true);
		});
	}, []);
	if (!initialized) {
		return <></>;
	}
	return (
		<TestContextProvider>
			<CommonContextProvider>
				<SafeAreaView style={styles.container}>
					<StatusBar style="auto" />
					<Page />
				</SafeAreaView>
			</CommonContextProvider>
		</TestContextProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});

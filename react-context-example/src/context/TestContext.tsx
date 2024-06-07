import { createContext } from "react";

export const TestContext = createContext({
	test: false,
});

export const TestContextProvider = ({ children }: { children: any }) => {
    console.log("test-rendered");
    
	return (
		<TestContext.Provider value={{ test: true }}>
			{children}
		</TestContext.Provider>
	);
};

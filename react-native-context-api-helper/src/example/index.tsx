import React, { useContext } from "react";

import { CommonContextProvider } from "./context/CommonContext";
import { PageComponent } from "./pages";

function Home() {
	return (
		<CommonContextProvider>
			<PageComponent />
		</CommonContextProvider>
	);
}

export default Home;

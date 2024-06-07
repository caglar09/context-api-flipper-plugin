import React from "react";
import { useCommonContext } from "../context/CommonContext";

const PageComponent = () => {
	const commonContext = useCommonContext();
	
	commonContext.setInitialized(true);

	return <div>PageComponent</div>;
};

export { PageComponent };

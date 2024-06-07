export const ContextHelper = {
	generateContextName: (prefix?: string) => {
		let _prefix = prefix ? prefix : new Date().getTime().toString();

		return `${_prefix}Context`;
	},
};

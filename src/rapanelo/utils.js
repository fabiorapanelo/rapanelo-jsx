export const flattenDeep = (arr) => (Array.isArray(arr)
	? arr.reduce((a, b) => a.concat(flattenDeep(b)), [])
	: [arr]);

export const argsChanged = (oldArgs, newArgs) => {
	if (oldArgs.length !== newArgs.length) {
		return true;
	}
	return oldArgs.some((oldArg, i) => oldArg !== newArgs[i]);
};

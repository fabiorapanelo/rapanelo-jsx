export function createStore(initialState, reducers) {
	let state = initialState;
	const subscribers = [];

	const getState = () => state;

	const dispatch = (action) => {
		if (typeof action === 'function') {
			action(dispatch, getState);
			return;
		}

		state = reducers.reduce((s, reducer) => reducer(s, action), state);
		subscribers.forEach((handler) => handler(state));
	};

	const subscribe = (handler) => {
		subscribers.push(handler);
		return () => {
			const index = subscribers.indexOf(handler);
			if (index > -1) {
				subscribers.splice(index, 1);
			}
		};
	};

	return {
		dispatch,
		subscribe,
		getState,
	};
}

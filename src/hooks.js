import { argsChanged } from './utils';
import global from './global';

function getHookByIndex(index) {
	const { oldVirtualNode } = global.wipVirtualNode;

	return (
		oldVirtualNode
		&& oldVirtualNode.hooks
		&& oldVirtualNode.hooks[index]
	);
}

function baseHook(initial, hookAction) {
	let hook = getHookByIndex(global.hookIndex);
	let isNew = false;
	if (!hook) {
		isNew = true;
		hook = { ...initial };
	}

	global.wipVirtualNode.hooks.push(hook);
	global.hookIndex++;

	return hookAction(hook, isNew);
}

export function useState(initialState) {
	return baseHook({ state: initialState, queue: [] }, (hook) => {
		hook.queue.forEach((action) => {
			hook.state = action(hook.state);
		});
		hook.queue = [];

		const setState = (action) => {
			hook.queue.push(action);
			global.wipRoot = {
				dom: global.wipVirtualNode.parent.dom,
				props: global.wipVirtualNode.parent.props,
				oldVirtualNode: global.wipVirtualNode.parent,
			};
			global.nextUnitOfWork = global.wipRoot;
			global.nodesToBeDeleted = [];
		};

		return [hook.state, setState];
	});
}

export function useEffect(action, args = []) {
	return baseHook({ args }, (hook, isNew) => {
		if (isNew || argsChanged(hook.args, args)) {
			action(args);
		}
	});
}

export function useStore(selector) {
	if (!global.store) {
		throw new Error('Store was not created.');
	}
	if (typeof selector !== 'function') {
		throw new Error('useStore needs a function as argument.');
	}

	return baseHook({ }, () => {
		const selectedState = selector(global.store.getState());
		return [selectedState, global.store.dispatch];
	});
}

export function useRef() {
	return baseHook({ current: null }, (hook) => hook);
}

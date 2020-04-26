import { createDom, updateDom } from './manipulate-dom';
import { flattenDeep, argsChanged } from './utils';
import { ADD_ELEMENT, UPDATE_ELEMENT, REMOVE_ELEMENT } from './constants';
export { Fragment, createElement } from './create-element';
export { createStore } from './create-store';

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let nodesToBeDeleted = [];
let wipVirtualNode = null;
let hookIndex = null;
let rapaneloStore = null;

export function render(element, container, store) {
	rapaneloStore = store;
	wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
		oldVirtualNode: currentRoot,
	};
	nextUnitOfWork = wipRoot;
	rapaneloStore && rapaneloStore.subscribe(storeUpdatedHandler)
}

function workLoop(deadline) {
	let timeFinished = false;
	while (nextUnitOfWork && !timeFinished) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
		timeFinished = deadline.timeRemaining() < 1;
	}

	if (!nextUnitOfWork && wipRoot) {
		commitRoot();
	}

	requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(virtualNode) {
	if (typeof virtualNode.type === 'function') {
		updateFunctionComponent(virtualNode);
	} else {
		updateHostComponent(virtualNode);
	}
	if (virtualNode.child) {
		return virtualNode.child;
	}
	let nextVirtualNode = virtualNode;
	while (nextVirtualNode) {
		if (nextVirtualNode.sibling) {
			return nextVirtualNode.sibling;
		}
		nextVirtualNode = nextVirtualNode.parent;
	}
	return undefined;
}

function updateFunctionComponent(virtualNode) {
	wipVirtualNode = virtualNode;
	hookIndex = 0;
	wipVirtualNode.hooks = [];
	const children = [virtualNode.type(virtualNode.props)];
	reconcileChildren(virtualNode, children);
}

function updateHostComponent(virtualNode) {
	if (!virtualNode.dom) {
		virtualNode.dom = createDom(virtualNode);
	}
	reconcileChildren(virtualNode, virtualNode.props.children);
}

function reconcileChildren(virtualNode, children) {
	children = flattenDeep(children);
	let index = 0;
	let oldVirtualNode = virtualNode.oldVirtualNode && virtualNode.oldVirtualNode.child;
	let prevSibling = null;

	while (index < children.length || oldVirtualNode != null) {
		const element = children[index];
		let newVirtualNode = null;

		const sameType = oldVirtualNode && element && element.type === oldVirtualNode.type;

		if (sameType) {
			newVirtualNode = {
				type: oldVirtualNode.type,
				props: element.props,
				dom: oldVirtualNode.dom,
				parent: virtualNode,
				oldVirtualNode,
				effectTag: UPDATE_ELEMENT,
			};
		}
		if (element && !sameType) {
			newVirtualNode = {
				type: element.type,
				props: element.props,
				dom: null,
				parent: virtualNode,
				oldVirtualNode: null,
				effectTag: ADD_ELEMENT,
			};
		}
		if (oldVirtualNode && !sameType) {
			oldVirtualNode.effectTag = REMOVE_ELEMENT;
			nodesToBeDeleted.push(oldVirtualNode);
		}

		if (oldVirtualNode) {
			oldVirtualNode = oldVirtualNode.sibling;
		}

		if (index === 0) {
			virtualNode.child = newVirtualNode;
		} else if (element) {
			prevSibling.sibling = newVirtualNode;
		}

		prevSibling = newVirtualNode;
		index++;
	}
}

function commitRoot() {
	nodesToBeDeleted.forEach(commitWork);
	commitWork(wipRoot.child);
	currentRoot = wipRoot;
	wipRoot = null;
}

function commitWork(virtualNode) {
	if (!virtualNode) {
		return;
	}

	let domParentVirtualNode = virtualNode.parent;
	while (!domParentVirtualNode.dom) {
		domParentVirtualNode = domParentVirtualNode.parent;
	}
	const domParent = domParentVirtualNode.dom;

	if (virtualNode.effectTag === ADD_ELEMENT && virtualNode.dom != null) {
		domParent.appendChild(virtualNode.dom);
	} else if (virtualNode.effectTag === UPDATE_ELEMENT && virtualNode.dom != null) {
		updateDom(virtualNode.dom, virtualNode.oldVirtualNode.props, virtualNode.props);
	} else if (virtualNode.effectTag === REMOVE_ELEMENT) {
		commitDeletion(virtualNode, domParent);
	}

	commitWork(virtualNode.child);
	commitWork(virtualNode.sibling);
}

function commitDeletion(virtualNode, domParent) {
	if (virtualNode.dom) {
		domParent.removeChild(virtualNode.dom);
	} else {
		commitDeletion(virtualNode.child, domParent);
	}
}

function getHookByIndex(index) {
	return (
		wipVirtualNode.oldVirtualNode
		&& wipVirtualNode.oldVirtualNode.hooks
		&& wipVirtualNode.oldVirtualNode.hooks[index]
	);
}

export function useState(initial) {
	const oldHook = getHookByIndex(hookIndex);
	const hook = {
		state: oldHook ? oldHook.state : initial,
		queue: [],
	};

	const actions = oldHook ? oldHook.queue : [];
	actions.forEach((action) => {
		hook.state = action(hook.state);
	});

	const setState = (action) => {
		hook.queue.push(action);
		wipRoot = {
			dom: wipVirtualNode.parent.dom,
			props: wipVirtualNode.parent.props,
			oldVirtualNode: wipVirtualNode.parent,
		};
		nextUnitOfWork = wipRoot;
		nodesToBeDeleted = [];
	};

	wipVirtualNode.hooks.push(hook);
	hookIndex++;
	return [hook.state, setState];
}

export function useEffect(action, args = []) {
	const oldHook = getHookByIndex(hookIndex);

	if (!oldHook || argsChanged(oldHook.args, args)) {
		action(args);
	}

	wipVirtualNode.hooks.push({
		args,
	});
	hookIndex++;
}

const storeUpdatedHandler = () => {
	wipRoot = {
		dom: currentRoot.dom,
		props: currentRoot.props,
		oldVirtualNode: currentRoot,
	};
	nextUnitOfWork = wipRoot;
	nodesToBeDeleted = [];
};

export function useStore(selector) {
	if (!rapaneloStore) {
		throw new Error('Store was not created.');
	}
	if (typeof selector !== 'function') {
		throw new Error('useStore needs a function as argument.');
	}

	const selectedState = selector(rapaneloStore.getState());

	return [selectedState, rapaneloStore.dispatch];
}

export function useRef() {
	const oldHook = getHookByIndex(hookIndex);
	const hook = oldHook ? oldHook : { current: null };

	wipVirtualNode.hooks.push(hook);
	hookIndex++;
	return hook;
}
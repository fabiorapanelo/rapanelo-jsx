import { createDom, updateDom } from './manipulate-dom';
import { flattenDeep } from './utils';
import { ADD_ELEMENT, UPDATE_ELEMENT, REMOVE_ELEMENT } from './constants';
import global from './global';

export function render(element, container, store) {
	global.store = store;
	global.wipRoot = {
		dom: container,
		props: {
			children: [element],
		},
		oldVirtualNode: global.currentRoot,
	};
	global.nextUnitOfWork = global.wipRoot;
	if (global.store) {
		global.store.subscribe(storeUpdatedHandler);
	}
}

function workLoop(deadline) {
	let timeFinished = false;
	while (global.nextUnitOfWork && !timeFinished) {
		global.nextUnitOfWork = performUnitOfWork(global.nextUnitOfWork);
		timeFinished = deadline.timeRemaining() < 1;
	}

	if (!global.nextUnitOfWork && global.wipRoot) {
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
	global.wipVirtualNode = virtualNode;
	global.hookIndex = 0;
	global.wipVirtualNode.hooks = [];
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
			global.nodesToBeDeleted.push(oldVirtualNode);
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
	global.nodesToBeDeleted.forEach(commitWork);
	commitWork(global.wipRoot.child);
	global.currentRoot = global.wipRoot;
	global.wipRoot = null;
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

function storeUpdatedHandler() {
	global.wipRoot = {
		dom: global.currentRoot.dom,
		props: global.currentRoot.props,
		oldVirtualNode: global.currentRoot,
	};
	global.nextUnitOfWork = global.wipRoot;
	global.nodesToBeDeleted = [];
}

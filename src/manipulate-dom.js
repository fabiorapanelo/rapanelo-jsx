import { TEXT_ELEMENT } from './constants';

const createDomElement = (virtualDom) => {
	if (virtualDom.type === TEXT_ELEMENT) {
		return document.createTextNode('');
	}
	return document.createElement(virtualDom.type);
};

export const createDom = (virtualDom) => {
	const dom = createDomElement(virtualDom);
	updateDom(dom, {}, virtualDom.props);
	return dom;
};

const isEvent = (name) => name.startsWith('on');
const isObject = (value) => typeof value === 'object';

export const updateDom = (dom, prevProps, nextProps) => {
	Object.entries(prevProps).forEach(([name, value]) => {
		if (!nextProps.hasOwnProperty(name)) {
			if (isEvent(name)) {
				updateEvent(dom, name, value, undefined);
			} else if (name === 'style') {
				updateStyle(dom, value, undefined);
			} else if (name !== 'children' && name !== 'ref') {
				delete dom[name];
			}
		}
	});

	Object.entries(nextProps).forEach(([name, value]) => {
		const previousValue = prevProps[name];
		if (previousValue !== value) {
			if (isEvent(name)) {
				updateEvent(dom, name, previousValue, value);
			} else if (name === 'style') {
				updateStyle(dom, previousValue, value);
			} else if (name === 'ref') {
				if (isObject(value)) {
					value.current = dom;
				}
			} else if (name !== 'children') {
				dom[name] = value;
			}
		}
	});
};

const getEventName = (name) => name.toLowerCase().substring(2);

const updateEvent = (dom, name, previousValue, value) => {
	const eventName = getEventName(name);
	if (previousValue) {
		dom.removeEventListener(eventName, previousValue);
	}
	if (value) {
		dom.addEventListener(eventName, value);
	}
}

const updateStyle = (dom, previousValue, value) => {
	if (isObject(previousValue)) {
		Object.entries(previousValue).forEach(([cssProperty]) => {
			delete dom.style[cssProperty];
		});
	}
	if (isObject(value)) {
		Object.assign(dom.style, value);
	}
}

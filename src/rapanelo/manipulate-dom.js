import { TEXT_ELEMENT } from './constants';

const createDomElement = (fiber) => {
	if (fiber.type === TEXT_ELEMENT) {
		return document.createTextNode('');
	}
	return document.createElement(fiber.type);
};

const isEvent = (name) => name.startsWith('on');
const getEventName = (name) => name.toLowerCase().substring(2);

export const updateDom = (dom, prevProps, nextProps) => {
	Object.entries(prevProps).forEach(([name, value]) => {
		if (!nextProps.hasOwnProperty(name)) {
			if (isEvent(name)) {
				dom.removeEventListener(getEventName(name), value);
			} else if (name !== 'children') {
				delete dom[name];
			}
		}
	});

	Object.entries(nextProps).forEach(([name, value]) => {
		const previousValue = prevProps[name];
		if (previousValue !== value) {
			if (isEvent(name)) {
				if (previousValue) {
					dom.removeEventListener(getEventName(name), previousValue);
				}
				dom.addEventListener(getEventName(name), value);
			} else if (name !== 'children') {
				dom[name] = value;
			}
		}
	});
};

export const createDom = (fiber) => {
	const dom = createDomElement(fiber);
	updateDom(dom, {}, fiber.props);
	return dom;
};

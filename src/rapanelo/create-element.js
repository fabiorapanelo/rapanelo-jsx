import { TEXT_ELEMENT } from './constants';

export function Fragment(props) {
	return props.children;
}

export function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.reduce((acc, child) => {
				if (typeof child === 'object') {
					acc.push(child);
				} else {
					const { length } = acc;
					if (length && acc[length - 1].type === TEXT_ELEMENT) {
						acc[length - 1].props.nodeValue += child;
					} else {
						acc.push(createTextElement(child));
					}
				}
				return acc;
			}, []),
		},
	};
}

function createTextElement(text) {
	return {
		type: TEXT_ELEMENT,
		props: {
			nodeValue: text,
		},
	};
}

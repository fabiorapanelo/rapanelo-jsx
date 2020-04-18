import {
	render,
	createElement,
	Fragment,
	useState,
	useEffect,
} from './rapanelo';

const Title = (props) => <h2>Hello {props.name}!</h2>;

const Panel = (props) => <div class="panel">{props.children}</div>;

const UseFragment = () => (
	<Fragment>
		<p>Lorem ipsum 3</p>
		<p>Lorem ipsum 4</p>
	</Fragment>
);

const Counter = () => {
	const [value, setValue] = useState(0);
	useEffect(() => {
		document.title = `You clicked ${value} times`;
	}, [value]);
	return (
		<div>
			<span>{`Clicked ${value} times`}</span>
			<button onClick={() => setValue((v) => v + 1)}>Increment</button>
		</div>
	);
};

const ChuckNorrisFacts = () => {
	const [facts, setFacts] = useState([]);
	useEffect(async () => {
		const response = await fetch('http://api.icndb.com/jokes/random/10');
		const data = await response.json();
		setFacts(() => data.value);
	}, []);
	return (
		<div>
			{facts.map((fact) => <p>{`#${fact.id} - ${fact.joke}`}</p>)}
		</div>
	);
};

const app = (
	<div>
		<Title name="Fabio Rapanelo" />
		<Panel>
			<p>Lorem ipsum</p>
			<p>Lorem ipsum 2</p>
			<UseFragment />
			<Counter />
			<Counter />
		</Panel>
		<ChuckNorrisFacts />
	</div>
);

const root = document.querySelector('#root');
render(app, root);

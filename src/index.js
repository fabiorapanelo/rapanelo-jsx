import {
	render,
	createElement,
	Fragment,
	useState,
	useEffect,
	createStore,
	useStore,
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

const ToDoApp = () => {
	const [todos, dispatch] = useStore(state => state.todos);
	return (
		<div>
			<div>
			{todos.map((todo) => {
				return <p>{`#${todo.id} - ${todo.description}`}</p>
			})}
			</div>
			
			<button onClick={() => dispatch({
				type: 'ADD_TODO',
				payload: {
					description: 'Fake todo'
				}
			})}>Add a new todo</button>
		</div>
	);
}

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
		<ToDoApp />
	</div>
);

const todoReducer = (state, action) => {
	if (action.type === 'ADD_TODO') {
		return {
			...state,
			todos: [...state.todos, {
				id: state.todos.length + 1,
				description: action.payload.description,
			}],
		};
	}

	return state;
};

const reducers = [
	todoReducer,
];

const store = createStore({ todos: [] }, reducers);
const root = document.querySelector('#root');
render(app, root, store);

# rapanelo-jsx

JSX render with hooks and integrated store

## Configuration

Install babel and babel presets

```bash
npm i @babel/core babel-loader @babel/preset-env @babel/preset-react --save-dev
```

Create a .babelrc file with the following content:

```json
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "esmodules": true
        }
      }
    ],
    [
      "@babel/preset-react",
      {
        "pragma": "createElement", // default pragma is React.createElement
        "pragmaFrag": "Fragment", // default is React.Fragment
        "importSource": "rapanelo-jsx" // defaults to react
      }
    ]
  ]
}
```

Install rapanelo-jsx:

```bash
npm i rapanelo-jsx
```

## API

### render(element, container[, store])

```jsx
import { createElement, render } from "rapanelo-jsx";

const app = (
  <div>
    <h1 style={{ color: "red" }}>Hello World!</h1>
  </div>
);

const root = document.querySelector("#root");
render(app, root);
```

createElement import is required because babel transforms app variable into:

```js
const app = createElement(
  "div",
  null,
  createElement(
    "h1",
    {
      style: {
        color: "red",
      },
    },
    "Hello World!"
  )
);
```

### Fragment

```jsx
import { createElement, Fragment, render } from "rapanelo-jsx";

const FragmentUsage = () => (
  <Fragment>
    <p>Lorem ipsum 1</p>
    <p>Lorem ipsum 2</p>
  </Fragment>
);

const root = document.querySelector("#root");
render(<FragmentUsage />, root);
```

### createStore(initialState, reducers)

```jsx
import { createStore } from "rapanelo-jsx";

const todoReducer = (state, action) => {
  if (action.type === "ADD_TODO") {
    return {
      ...state,
      todos: [
        ...state.todos,
        {
          id: state.todos.length + 1,
          description: action.payload.description,
        },
      ],
    };
  }

  return state;
};

const store = createStore({ todos: [] }, [todoReducer]);

store.subscribe((handler) => console.log(handler));

store.dispatch({
  type: "ADD_TODO",
  payload: {
    description: "To do description",
  },
});

console.log(store.getState());
```

### useState(initialValue)

```jsx
import { createElement, render, useState } from "rapanelo-jsx";

const Counter = () => {
  const [value, setValue] = useState(0);
  return (
    <div>
      <span>{`Clicked ${value} times`}</span>
      <button onClick={() => setValue((v) => v + 1)}>Increment</button>
    </div>
  );
};

const root = document.querySelector("#root");
render(<Counter />, root);
```

### useEffect(action, args)

useEffect action is triggered when the args parameter changes.

```jsx
import { createElement, render, useState, useEffect } from "rapanelo-jsx";

const ChuckNorrisFacts = () => {
  const [facts, setFacts] = useState([]);
  useEffect(async () => {
    const response = await fetch("http://api.icndb.com/jokes/random/10");
    const data = await response.json();
    setFacts(() => data.value);
  }, []);
  return (
    <div>
      {facts.map((fact) => (
        <p>{`#${fact.id} - ${fact.joke}`}</p>
      ))}
    </div>
  );
};

const root = document.querySelector("#root");
render(<ChuckNorrisFacts />, root);
```

### useRef()

```jsx
import { createElement, render, useRef } from "rapanelo-jsx";

const Alert = () => {
  const inputRef = useRef();

  const displayName = () => {
    const { value } = inputRef.current;
    if (!value) return;
    alert(`Hello ${value}`);
  };

  return (
    <div>
      <input type="text" ref={inputRef}></input>
      <button onClick={displayName}>Display Name</button>
    </div>
  );
};

const root = document.querySelector("#root");
render(<Alert />, root);
```

### useStore(selector)

```jsx
import {
  createElement,
  render,
  useRef,
  createStore,
  useStore,
} from "rapanelo-jsx";

const ToDoApp = () => {
  const [todos, dispatch] = useStore((state) => state.todos);
  const inputRef = useRef();

  const addTodo = () => {
    const { value } = inputRef.current;
    if (!value) return;
    inputRef.current.value = "";
    inputRef.current.focus();

    dispatch({
      type: "ADD_TODO",
      payload: {
        description: value,
      },
    });
  };

  return (
    <div>
      <input type="text" ref={inputRef}></input>
      <button onClick={addTodo}>Add a new todo</button>
      <div>
        {todos.map((todo) => (
          <p>{`#${todo.id} - ${todo.description}`}</p>
        ))}
      </div>
    </div>
  );
};

const todoReducer = (state, action) => {
  if (action.type === "ADD_TODO") {
    return {
      ...state,
      todos: [
        ...state.todos,
        {
          id: state.todos.length + 1,
          description: action.payload.description,
        },
      ],
    };
  }

  return state;
};

const store = createStore({ todos: [] }, [todoReducer]);
const root = document.querySelector("#root");
render(<ToDoApp />, root, store);
```

# Typed-state-machine-core

React bindings for [typed-state-machine](https://github.com/GrzegorzKazana/typed-state-machine).

## Installation

```
npm install @grzegorzkazana/typed-state-machine-react --registry https://npm.pkg.github.com
```

## Usage

For general concepts and usage see [typed-state-machine](https://github.com/GrzegorzKazana/typed-state-machine).

### Instantiation

```tsx
const useMachine = createUseStateMachine<keyof States, States, typeof transitions>(
    transitions,
    handlers,
);

const App = () => {
    const machine = useMachine('initialStateKey', {
        /* initialState */
    });

    // ...
};
```

## Examples

[Usage with react.](https://github.com/GrzegorzKazana/typed-state-machine/tree/master/packages/react/examples)

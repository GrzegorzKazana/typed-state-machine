# Typed-state-machine

Tiny (~0.6/0.8kB) strongly typed finite state machine for managing state in your apps.
For react hook bindings see [@typed-state-machine/react](https://github.com/GrzegorzKazana/typed-state-machine/tree/master/packages/react).

## Installation

As the pacakges are hosted on github pacakge repository, it is needed to point to repo url. Also, packages are under my scope `@grzegorzkazana`.

```
npm install @grzegorzkazana/typed-state-machine-core --registry https://npm.pkg.github.com
// or
npm install @grzegorzkazana/typed-state-machine-react --registry https://npm.pkg.github.com
```

## Concepts

### State matrix

Matrix of states defines shape of data in each state.

```typescript
type States = {
    pending: {};
    fulfilled: { data: Response };
    rejected: { err: Error };
};
```

### Transition matrix

Matrix listing what transitions may be performed from each state.

```typescript
const transitions = {
    pending: ['fulfilled', 'rejected'],
    fulfilled: [],
    rejected: [],
} as const;
```

### Transition handlers (optional)

Callbacks called after transition to given state.

```typescript
const handlers = {
    fulfilled: (to, state) => console.log(`Fetched: ${state.data}`),
    rejected: (to, state) => console.log(`Failed: ${state.err}`),
};
```

Callbacks may also trigger subsequent sync or async transitions using `to` object. `to` is fully typed and has defined properties of coresponding possible state changes in state under current key. It accepts next state value based on State Matrix.

```typescript
const handlers = {
    pending: to =>
        // e.g. trigger side effect that will cause next transition
        httpService
            .get(/* ... */)
            .then(data => to.fulfilled({ data }))
            .catch(err => to.rejected({ err })),
};
```

## Interacting with state machine

### Instantiation

```typescript
const initMachine = stateful<keyof States, States, typeof transitions>(transitions, handlers);
const machine = initMachine('pending', {});
```

### Checking current state

```typescript
machine.isInState(stateKey: StateKeys): boolean

machine.isInState('pending')    // boolean
```

### Reading current state

```typescript
machine.getOr<K extends StateKeys, D>(stateKey: K, defaultVal: D | undefined = undefined)

machine.getOr('fulfilled')      // { data: Response } | undefined
machine.getOr('rejected')       // { err: Error } | undefined
machine.getOr('rejected', 42)   // { err: Error } | number
```

### Folding state

```typescript
machine.fold<K extends StateKeys, H extends StateFolders<K, StateMatrix, TransitionMatrix>, D = null>(
    handlers: H,
    defaultVal?: D,
): [StateKeys] extends [keyof H] ? SafeReturnType<H[K]> : SafeReturnType<H[keyof H]> | D

machine.fold({
    pending: () => 42,
    fulfilled: ({ data }) => data.statusText
}) // number | string | undefined

machine.fold({
    pending: () => 42,
    fulfilled: ({ data }) => data.statusText,
    rejected: ({ error }) => error.message,
}) // number | string, (non nullable if exhaustive)
```

### Triggering transitions

```typescript
machine.transition<H extends TransitionHandlers<StateKeys, StateMatrix, TransitionMatrix>>(
    handlers: H,
): void;

machine.transition({
    // if current state is 'pending' go to 'fulfilled' state
    pending: to => to.fulfilled({ data: { /* ... */ } }),
})
```

## Usage

[Usage with vanilla TS.](https://github.com/GrzegorzKazana/typed-state-machine/tree/master/packages/core/examples)

[Usage with react.](https://github.com/GrzegorzKazana/typed-state-machine/tree/master/packages/react/examples)

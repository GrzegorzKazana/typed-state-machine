import {
    PossibleState,
    PossibleTransitions,
    shallowMerge,
    canIndex,
    SafeReturnType,
} from './utils';

type StateHandlers<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>
> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in AllowedStateKeys]?: (state: StateMatrix[K]) => any;
};

type TransitionObject<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>,
    TransitionMatrix extends PossibleTransitions<AllowedStateKeys>,
    TransitionTarget extends AllowedStateKeys
> = { [L in TransitionMatrix[TransitionTarget][number]]: (newState: StateMatrix[L]) => void };

type TransitionReqHandlers<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>,
    TransitionMatrix extends PossibleTransitions<AllowedStateKeys>
> = {
    [K in AllowedStateKeys]?: (
        transitionObj: TransitionObject<AllowedStateKeys, StateMatrix, TransitionMatrix, K>,
    ) => void;
};

type TransitionHandlers<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>,
    TransitionMatrix extends PossibleTransitions<AllowedStateKeys>
> = {
    [K in AllowedStateKeys]?: (
        newState: StateMatrix[K],
        transitionObj: TransitionObject<AllowedStateKeys, StateMatrix, TransitionMatrix, K>,
    ) => void;
};

type StatefulMachine<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>,
    TransitionMatrix extends PossibleTransitions<AllowedStateKeys>
> = {
    value: StateMatrix[AllowedStateKeys];
    state: AllowedStateKeys;
    possibleTransitions: TransitionMatrix;
    transitionHandlers: TransitionHandlers<AllowedStateKeys, StateMatrix, TransitionMatrix>;
} & {
    isInState(stateKey: AllowedStateKeys): boolean;
    canTransitionTo(stateKey: AllowedStateKeys): boolean;
    setState<K extends AllowedStateKeys>(stateKey: K, state: StateMatrix[K]): void;
    fold<K extends AllowedStateKeys, H extends StateHandlers<K, StateMatrix>, D = null>(
        handlers: H,
        defaultVal?: D,
    ): [AllowedStateKeys] extends [keyof H] ? SafeReturnType<H[K]> : SafeReturnType<H[keyof H]> | D;
    transition<H extends TransitionReqHandlers<AllowedStateKeys, StateMatrix, TransitionMatrix>>(
        handlers: H,
    ): void;
    getTransitionObjForState<K extends AllowedStateKeys>(
        stateKey: K,
    ): { [L in TransitionMatrix[K][number]]: (newState: StateMatrix[L]) => void };
};

export default function createStatefulMachine<
    AllowedStateKeys extends string,
    StateMatrix extends PossibleState<AllowedStateKeys>,
    TransitionMatrix extends PossibleTransitions<AllowedStateKeys>
>(
    transitions: TransitionMatrix,
    transitionHandlers: TransitionHandlers<AllowedStateKeys, StateMatrix, TransitionMatrix> = {},
): <CurrentKey extends AllowedStateKeys>(
    initStateKey: CurrentKey,
    initState: StateMatrix[CurrentKey],
) => StatefulMachine<AllowedStateKeys, StateMatrix, TransitionMatrix> {
    return (initStateKey, initState) => {
        return {
            value: initState,
            state: initStateKey,
            possibleTransitions: transitions,
            transitionHandlers,
            isInState(stateKey) {
                return this.state === stateKey;
            },
            canTransitionTo(stateKey) {
                return this.possibleTransitions[this.state].includes(stateKey);
            },
            setState(stateKey, newState) {
                this.value = newState;
                this.state = stateKey;
                const handler = this.transitionHandlers[stateKey];
                handler && handler(newState, this.getTransitionObjForState(stateKey));
            },
            transition(handlers) {
                const transitionObject = this.getTransitionObjForState(this.state);
                const currentHandler = handlers[this.state];
                currentHandler && currentHandler(transitionObject);
            },
            fold(handlers, defaultVal) {
                const currentHandler = canIndex(handlers, this.state) && handlers[this.state];
                return currentHandler ? currentHandler(this.value) : defaultVal;
            },
            getTransitionObjForState(currentState) {
                const methodObjs = this.possibleTransitions[currentState].map(newKey => ({
                    [newKey]: (newState: StateMatrix[typeof newKey]) =>
                        this.setState(newKey, newState),
                }));

                return shallowMerge(...methodObjs);
            },
        };
    };
}

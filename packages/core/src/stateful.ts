import { shallowMerge, canIndex } from './utils';
import {
    PossibleStateValues,
    PossibleTransitions,
    TransitionHandlers,
    StateFolders,
    SafeReturnType,
    ArrayUnion,
} from './types';

export type StatefulMachine<
    StateKeys extends string,
    StateMatrix extends PossibleStateValues<StateKeys>,
    TransitionMatrix extends PossibleTransitions<StateKeys>
> = {
    value: StateMatrix[StateKeys];
    state: StateKeys;
    isInState(stateKey: StateKeys): boolean;
    canTransitionTo(stateKey: StateKeys): boolean;
    fold<K extends StateKeys, H extends StateFolders<K, StateMatrix>, D = null>(
        handlers: H,
        defaultVal?: D,
    ): [StateKeys] extends [keyof H] ? SafeReturnType<H[K]> : SafeReturnType<H[keyof H]> | D;
    transition<H extends TransitionHandlers<StateKeys, StateMatrix, TransitionMatrix>>(
        handlers: H,
    ): void;
};

export type StatefulMachineInternals<
    StateKeys extends string,
    StateMatrix extends PossibleStateValues<StateKeys>,
    TransitionMatrix extends PossibleTransitions<StateKeys>
> = {
    possibleTransitions: TransitionMatrix;
    transitionHandlers: TransitionHandlers<StateKeys, StateMatrix, TransitionMatrix>;
    setState<K extends StateKeys>(stateKey: K, state: StateMatrix[K]): void;
    getTransitionObjForState<K extends StateKeys>(
        stateKey: K,
    ): { [L in ArrayUnion<TransitionMatrix[K]>]: (newState: StateMatrix[L]) => void };
};

export default function createStatefulMachine<
    StateKeys extends string,
    StateMatrix extends PossibleStateValues<StateKeys>,
    TransitionMatrix extends PossibleTransitions<StateKeys>
>(
    transitions: TransitionMatrix,
    transitionHandlers: TransitionHandlers<StateKeys, StateMatrix, TransitionMatrix> = {},
): <CurrentKey extends StateKeys>(
    initStateKey: CurrentKey,
    initState: StateMatrix[CurrentKey],
) => StatefulMachine<StateKeys, StateMatrix, TransitionMatrix> &
    StatefulMachineInternals<StateKeys, StateMatrix, TransitionMatrix> {
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
                currentHandler && currentHandler(this.value, transitionObject);
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

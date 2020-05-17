import { canIndex, buildObjFromKeys, isValueRepresentingKey } from './utils';
import {
    PossibleStateValues,
    PossibleTransitions,
    TransitionHandlers,
    TransitionObject,
    StateFolders,
    SafeReturnType,
} from './types';

export type StatefulMachine<
    StateKeys extends string,
    StateMatrix extends PossibleStateValues<StateKeys>,
    TransitionMatrix extends PossibleTransitions<StateKeys>
> = {
    value: StateMatrix[StateKeys];
    state: StateKeys;
    isInState(stateKey: StateKeys): boolean;
    getOr<K extends StateKeys>(stateKey: K): StateMatrix[K] | undefined;
    getOr<K extends StateKeys, D>(stateKey: K, defaultVal: D): StateMatrix[K] | D;
    fold<K extends StateKeys, H extends StateFolders<K, StateMatrix, TransitionMatrix>, D = null>(
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
    setState<K extends StateKeys>(stateKey: K, state: StateMatrix[K]): void;
    getTransitionObjForState<K extends StateKeys>(
        stateKey: K,
    ): TransitionObject<StateKeys, StateMatrix, TransitionMatrix, K>;
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
            isInState(stateKey) {
                return this.state === stateKey;
            },
            getOr<K extends StateKeys, D>(stateKey: K, defaultVal: D | undefined = undefined) {
                return isValueRepresentingKey(stateKey, this.state, this.value)
                    ? this.value
                    : defaultVal;
            },
            setState(stateKey, newState) {
                this.value = newState;
                this.state = stateKey;
                const handler = transitionHandlers[stateKey];
                handler && handler(this.getTransitionObjForState(stateKey), newState);
            },
            transition(handlers) {
                const transitionObject = this.getTransitionObjForState(this.state);
                const currentHandler = handlers[this.state];
                currentHandler && currentHandler(transitionObject, this.value);
            },
            fold(handlers, defaultVal) {
                const currentHandler = canIndex(handlers, this.state) && handlers[this.state];
                return currentHandler
                    ? currentHandler(this.value, this.getTransitionObjForState(this.state))
                    : defaultVal;
            },
            getTransitionObjForState(currentState) {
                return buildObjFromKeys(
                    transitions[currentState],
                    key => (newState: StateMatrix[typeof key]) => this.setState(key, newState),
                );
            },
        };
    };
}

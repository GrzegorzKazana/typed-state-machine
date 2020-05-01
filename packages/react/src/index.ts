import { useState, useEffect } from 'react';
import {
    StatefulMachine,
    PossibleStateValues,
    PossibleTransitions,
    TransitionHandlers,
    StateFolders,
    SafeReturnType,
    ArrayUnion,
} from '@typed-state-machine/core';
import { utils } from '@typed-state-machine/core/';

import { useIsMounted } from './utils';

export default function createUseStateMachine<
    StateKeys extends string,
    StateMatrix extends PossibleStateValues<StateKeys>,
    TransitionMatrix extends PossibleTransitions<StateKeys>
>(
    possibleTransitions: TransitionMatrix,
    transitionHandlers: TransitionHandlers<StateKeys, StateMatrix, TransitionMatrix> = {},
): <CurrentKey extends StateKeys>(
    initStateKey: CurrentKey,
    initState: StateMatrix[CurrentKey],
) => StatefulMachine<StateKeys, StateMatrix, TransitionMatrix> {
    return (initStateKey, initState) => {
        const isMounted = useIsMounted();
        const [[state, value], setStateAndValue] = useState<[StateKeys, StateMatrix[StateKeys]]>([
            initStateKey,
            initState,
        ]);

        const isInState = (stateKey: StateKeys) => stateKey === state;

        const canTransitionTo = (stateKey: StateKeys) =>
            possibleTransitions[state].includes(stateKey);

        const setState = <K extends StateKeys>(stateKey: K, state: StateMatrix[K]) =>
            setStateAndValue([stateKey, state]);

        const fold = <K extends StateKeys, H extends StateFolders<K, StateMatrix>, D = null>(
            handlers: H,
            defaultVal?: D,
        ): [StateKeys] extends [keyof H]
            ? SafeReturnType<H[K]>
            : SafeReturnType<H[keyof H]> | D => {
            const handler = utils.canIndex(handlers, state) && handlers[state];
            return handler ? handler(value) : defaultVal;
        };

        const getTransitionObjForState = <K extends StateKeys>(
            currentState: K,
        ): { [L in ArrayUnion<TransitionMatrix[K]>]: (newState: StateMatrix[L]) => void } => {
            const methodObjs = possibleTransitions[currentState].map(newKey => ({
                [newKey]: (newState: StateMatrix[typeof newKey]) =>
                    setStateAndValue([newKey, newState]),
            }));

            return utils.shallowMerge(...methodObjs);
        };

        const transition = <H extends TransitionHandlers<StateKeys, StateMatrix, TransitionMatrix>>(
            handlers: H,
        ): void => {
            const transitionObject = getTransitionObjForState(state);
            const currentHandler = handlers[state];
            currentHandler && currentHandler(value, transitionObject);
        };

        useEffect(() => {
            const handler = transitionHandlers[state];
            isMounted() && handler && handler(value, getTransitionObjForState(state));
        }, [state, value, isMounted]);

        return {
            value,
            state,
            possibleTransitions,
            transitionHandlers,
            isInState,
            setState,
            canTransitionTo,
            fold,
            transition,
            getTransitionObjForState,
        };
    };
}

import { useState, useEffect } from 'react';
import {
    StatefulMachine,
    PossibleStateValues,
    PossibleTransitions,
    TransitionHandlers,
    StatefulMachineInternals,
} from '@typed-state-machine/core';
import { utils } from '@typed-state-machine/core';

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
    type StoredState = [StateKeys, StateMatrix[StateKeys]];
    type Machine = StatefulMachine<StateKeys, StateMatrix, TransitionMatrix> &
        StatefulMachineInternals<StateKeys, StateMatrix, TransitionMatrix>;

    return (initStateKey, initState) => {
        const isMounted = useIsMounted();
        const [[state, value], setStateAndValue] = useState<StoredState>([initStateKey, initState]);

        const fold: Machine['fold'] = (handlers, defaultVal) => {
            const handler = utils.canIndex(handlers, state) && handlers[state];
            return handler ? handler(value) : defaultVal;
        };

        const getTransitionObjForState: Machine['getTransitionObjForState'] = currentState => {
            const methodObjs = possibleTransitions[currentState].map(newKey => ({
                [newKey]: (newState: StateMatrix[typeof newKey]) =>
                    setStateAndValue([newKey, newState]),
            }));

            return utils.shallowMerge(...methodObjs);
        };

        const transition: Machine['transition'] = handlers => {
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
            isInState: stateKey => stateKey === state,
            canTransitionTo: stateKey => possibleTransitions[state].includes(stateKey),
            fold,
            transition,
        };
    };
}

import { useState, useEffect } from 'react';
import {
    StatefulMachine,
    PossibleStateValues,
    PossibleTransitions,
    TransitionHandlers,
    StatefulMachineInternals,
} from '@GrzegorzKazana/typed-state-machine-core';
import { utils } from '@GrzegorzKazana/typed-state-machine-core';

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
    type GetTransitionObjForState = Machine['getTransitionObjForState'];

    return (initStateKey, initState) => {
        const isMounted = useIsMounted();
        const [[state, value], setStateAndValue] = useState<StoredState>([initStateKey, initState]);

        const getTransitionObjForState: GetTransitionObjForState = currentState =>
            utils.buildObjFromKeys(
                possibleTransitions[currentState],
                key => (newState: StateMatrix[typeof key]) => setStateAndValue([key, newState]),
            );

        useEffect(() => {
            const handler = transitionHandlers[state];

            if (handler && isMounted()) {
                const transitionObj = getTransitionObjForState(state);
                handler(transitionObj, value);
            }
        }, [state, value, isMounted]);

        return {
            value,
            state,
            isInState: stateKey => stateKey === state,
            getOr: <K extends StateKeys, D>(stateKey: K, defaultVal: D | undefined = undefined) =>
                utils.isValueRepresentingKey(stateKey, state, value) ? value : defaultVal,
            fold: (handlers, defaultVal) => {
                const handler = utils.canIndex(handlers, state) && handlers[state];
                return handler ? handler(value) : defaultVal;
            },
            transition: handlers => {
                const transitionObject = getTransitionObjForState(state);
                const currentHandler = handlers[state];
                currentHandler && currentHandler(transitionObject, value);
            },
        };
    };
}

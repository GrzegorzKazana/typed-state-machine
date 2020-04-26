import createMachine from '../src/index';
import { States, transitions } from './mocks';

describe('when creating state machine', () => {
    const initMachine = createMachine<keyof States, States, typeof transitions>(
        transitions,
    );

    it('correctly applies the first state', () => {
        const idleMachine = initMachine('idle', { a: 1 });

        expect(idleMachine.value).toEqual({ a: 1 });
    });

    it('has only allowed transition functions', () => {
        const idleMachine = initMachine('idle', { a: 1 });
        const transitionFns = Object.entries(idleMachine)
            .filter(([_, val]) => typeof val === 'function')
            .map(([key]) => key);
        const expectedTransitions = ['pending'];

        expect(transitionFns).toEqual(
            expect.arrayContaining(expectedTransitions),
        );
    });

    it('correcty transitions for state a to state b', () => {
        const idleMachine = initMachine('idle', { a: 1 });
        const pendingMachine = idleMachine.pending({ b: 2 });

        expect(pendingMachine.value).toEqual({ b: 2 });
    });

    it('has only allowed transition functions in subsequent states', () => {
        const idleMachine = initMachine('idle', { a: 1 });
        const pendingMachine = idleMachine.pending({ b: 2 });
        const transitionFns = Object.entries(pendingMachine)
            .filter(([_, val]) => typeof val === 'function')
            .map(([key]) => key);
        const expectedTransitions = ['fetched', 'failed'];

        expect(transitionFns).toEqual(
            expect.arrayContaining(expectedTransitions),
        );
    });
});

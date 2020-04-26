import machine from './src/index';

type AllowedStates = 'idle' | 'pending' | 'fetched' | 'failed';
const firstState = { a: 0 };

const initialState = {
    idle: { a: 0 },
    pending: { b: 1 },
    fetched: { c: 2 },
    failed: { d: 3 },
};

type PossibleStates = {
    idle: { a: number };
    pending: { b: number };
    fetched: { c: number };
    failed: { d: number };
};

const transitions = {
    idle: ['pending'],
    pending: ['fetched', 'failed'],
    fetched: ['idle', 'fetched'],
    failed: ['pending'],
} as const;
type TransitionMatrix_ = typeof transitions;

const a = machine<AllowedStates, PossibleStates, TransitionMatrix_>(
    transitions,
)('idle', { a: 1 });

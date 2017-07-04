interface IPosisCooperativeScheduling {
    // CPU used by process so far. Might include setup time kernel chooses to charge to the process.
    readonly used: number;
    // CPU budget scheduler allocated to this process. 
    readonly budget: number;
    // Process can call wrap its logic in a generator function passed to wrap() (see coop.bundle.ts for example)
    // Process can yield a callback whith serialization or other wrapping up logic.
    // Yield will either return, indicating there is spare CPU, or callback will be called and yield will not return, ending execution for current tick.
    // See coop.bundle.ts for example of both generator and wrap implementation.
    wrap?(makeIterator: () => IterableIterator<void | (() => void)>): void;
}

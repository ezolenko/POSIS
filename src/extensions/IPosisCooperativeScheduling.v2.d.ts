interface IPosisCooperativeSchedulingV2 {
    // CPU used by process so far. Might include setup time kernel chooses to charge to the process.
    readonly used: number;
    // CPU budget scheduler allocated to this process. 
    readonly budget: number;
    // Process can call yield with a callback when it is ready to give up for the tick, but can continue if CPU is available. 
    // Call will either return, indicating there is spare CPU, or callback will be called and yield will not return, ending execution for current tick.
    // Use callback to do last minute tasks like saving current state, etc.
    // The call will throw, so avoid catching generic exceptions around it.
    yield(cb: () => void): void;
}

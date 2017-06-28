interface IPosisCooperativeSchedulingV1 {
    // CPU used by process so far. Might include setup time kernel chooses to charge to the process.
    readonly used: number;
    // CPU budget scheduler allocated to this process. 
    readonly budget: number;
}

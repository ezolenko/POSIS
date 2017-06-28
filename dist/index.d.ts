type PosisPID = string | number;

type PosisInterfaces = {
	baseKernel: IPosisKernel;
	spawn: IPosisSpawnExtension;
	coop: IPosisCooperativeScheduling;
}
// Bundle for programs that are logically grouped
interface IPosisBundle {
	install(registry: IPosisProcessRegistry): void;

	// image name of root process in the bundle, if any
	rootImageName?: string;
}
interface IPosisExtension {}
interface IPosisKernel extends IPosisExtension {
    startProcess(imageName: string, startContext: any): IPosisProcess | undefined;
    // killProcess also kills all children of this process
    // note to the wise: probably absorb any calls to this that would wipe out your entire process tree.
    killProcess(pid: PosisPID): void;
    getProcessById(pid: PosisPID): IPosisProcess | undefined;

    // passing undefined as parentId means "make me a root process"
    // i.e. one that will not be killed if another process is killed
    setParent(pid: PosisPID, parentId?: PosisPID): boolean;
}
interface IPosisLogger {
    // because sometimes you don't want to eval arguments to ignore them
    debug(message: (() => string) | string): void;
    info(message: (() => string) | string): void;
    warn(message: (() => string) | string): void;
    error(message: (() => string) | string): void;
}
interface IPosisProcessContext {
    readonly memory: any; // private memory
    readonly imageName: string; // image name (maps to constructor)
    readonly id: PosisPID; // ID
    readonly parentId: PosisPID; // Parent ID
    readonly log: IPosisLogger; // Logger 
    queryPosisInterface<T extends keyof PosisInterfaces>(interfaceId: T): PosisInterfaces[T] | undefined;
}

// Bundle: Don't write to context object (including setting new props on it), host will likely freeze it anyway. 
// Host: freeze the thing!
interface PosisProcessConstructor {
    new (context: IPosisProcessContext): IPosisProcess;
}

interface IPosisProcess {
    // Main function, implement all process logic here. 
    run(): void; 
}
interface IPosisProcessRegistry {
	// name your processes' image names with initials preceding, like ANI/MyCoolPosisProgram (but the actual class name can be whatever you want)
	// if your bundle consists of several programs you can pretend that we have a VFS: "ANI/MyBundle/BundledProgram1"
	register(imageName: string, constructor: new (context: IPosisProcessContext) => IPosisProcess): boolean;
}
interface IPosisCooperativeScheduling {
    // CPU used by process so far. Might include setup time kernel chooses to charge to the process.
    readonly used: number;
    // CPU budget scheduler allocated to this process. 
    readonly budget: number;
    // Process can call yield with a callback when it is ready to give up for the tick, but can continue if CPU is available. 
    // Call will either return, indicating there is spare CPU, or callback will be called and yield will not return, ending execution for current tick.
    // Use callback to do last minute tasks like saving current state, etc.
    // The call will throw, so avoid catching generic exceptions around it.
    // If yield is not provided, fall back to `if (used >= budget) return;`
    yield?(cb: () => void): void;
}
declare const enum EPosisSpawnStatus {
    ERROR = -1,
    QUEUED,
    SPAWNING,
    SPAWNED
}

// NOT FINAL, discussions still underway in slack #posis

// process calls spawnCreep, checks status, if not ERROR, poll 
// getStatus until status is SPAWNED (Handling ERROR if it happens),
// then call getCreep to get the creep itself

interface IPosisSpawnExtension {
    // Queues/Spawns the creep and returns an ID
    spawnCreep(opts: { 
        //   - 'rooms' are names of rooms associated with the creep being spawned.
        //     Must contain at least one room. Host should select spawner based on its own logic
        //     May contain additional rooms as a hints to host. Host may ignore hints
        rooms: string[], 
        //   - 'body' are body variants of the creep being spawned, al least one must be provided
        //     Host must guarantee that the spawning creep will have one of provided bodies
        //     Which body to spawn is up to host to select based on its own logic
        body: string[][], 
        //   - 'priority' is spawn priority in range -1000 (the highest) to 1000 (the lowest)
        //     Used as a hint for host's logic. Host may (but not guarantee) spawn creeps in priority order
        priority?: number, 
        //   - 'pid' is id of the process which is spawned creep associated to
        //     Used as a hint for host's logic. Host may (but not guarantee) consider currently spawned creeps
        //     detached, may (but not guarantee) remove scheduled creeps from queue on process termination
        pid?: PosisPID }): string;
    // Used to see if its been dropped from queue
    getStatus(id: string): {
        status: EPosisSpawnStatus
        message?: string
    }
    getCreep(id: string): Creep | undefined;
}

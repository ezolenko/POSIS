class CooperativeProcess implements IPosisProcess
{
    public static ImageName = "POSISTest/CoopTestProcess";

    private context: IPosisProcessContext;

    constructor(context: IPosisProcessContext)
    {
        this.context = context;
    }

    run()
    {
        const coop = this.context.queryPosisInterface('coop');
        if (!coop)
        {
            let now = Game.cpu.getUsed()
            coop = { // Shim it!
                budget: Game.cpu.limit - now,
                get used() { return Game.cpu.getUsed() - now }
            }
        }
        if (!coop.wrap)
        {
            coop.wrap = function (makeIterator)
            {
                const iterator = makeIterator();
                let result = undefined;
                while (coop.used < coop.budget)
                {
                    if (result && result.done)
                    {
                        break;
                    }
                    result = iterator.next();
                }
                if (result && typeof result.value == 'function')
                {
                    return result.value();
                }
            }
        }
        coop.wrap(() => this.runCoop())
    }

    * runCoop()
    {
        // do expensive stuff
        
        // give kernel option to cancel
        this.context.log.info("yielding");
        yield; 

        // do more stuff

        // give kernel another option to cancel, this time with shutdown function
        this.context.log.info("yielding again");
        yield () =>
        { 
            // save results
            this.context.log.info("wrapping up");
        };

        this.context.log.info("completing the process");
    }
}

export const bundle: IPosisBundle<void> =
{
    install(registry: IPosisProcessRegistry)
    {
        registry.register(CooperativeProcess.ImageName, CooperativeProcess);
    },
    rootImageName: CooperativeProcess.ImageName,
};

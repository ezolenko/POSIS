type PosisPID = string | number;

interface PosisInterfaces {
	baseKernel: IPosisKernel;
	spawn: IPosisSpawnExtension;
	coop: IPosisCooperativeScheduling;
	sleep: IPosisSleepExtension;
}

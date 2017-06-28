type PosisPID = string | number;

type PosisInterfaces = {
	baseKernel: IPosisKernel;
	spawn: IPosisSpawnExtension;
	"coop.v1": IPosisCooperativeSchedulingV1;
	"coop.v2": IPosisCooperativeSchedulingV2;
}

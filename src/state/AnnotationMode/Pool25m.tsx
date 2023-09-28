import { StrokeRange } from '../AKB/StrokeCounts';
import { AnnotationMode, Checkpoint } from './AnnotationMode';

function firstLapCheckpoint(startDistance: number): Array<Checkpoint> {
  return [
    { name: `${startDistance}m`, distanceMeter: startDistance },
    { name: `${startDistance + 15}m`, distanceMeter: startDistance + 15 },
    { name: `${startDistance + 20}m`, distanceMeter: startDistance + 20 },
    { name: `${startDistance + 25}m`, distanceMeter: startDistance + 25 },
  ];
}

function subsequentLapCheckpoint(startDistance: number): Array<Checkpoint> {
  return [
    { name: `${startDistance + 10}m`, distanceMeter: startDistance + 10 },
    { name: `${startDistance + 20}m`, distanceMeter: startDistance + 20 },
    { name: `${startDistance + 25}m`, distanceMeter: startDistance + 25 },
  ];
}

function firstStrokeRange(startDistance: number): Array<StrokeRange> {
  return [
    new StrokeRange(startDistance + 15, startDistance + 20),
    new StrokeRange(startDistance, startDistance + 25),
  ];
}

function subsequentStrokeRange(startDistance: number): Array<StrokeRange> {
  return [
    new StrokeRange(startDistance + 10, startDistance + 20),
    new StrokeRange(startDistance, startDistance + 25),
  ];
}

export function createAnnotationMode25m(totalDistance: number): AnnotationMode {
  let distanceLeft = totalDistance;
  let checkpoints: Array<Checkpoint> = [];
  let strokeRanges: Array<StrokeRange> = [];
  const POOL_DISTANCE = 25;
  let lastDistance = 0;
  while (distanceLeft > 0) {
    if (checkpoints.length === 0) {
      checkpoints = checkpoints.concat(firstLapCheckpoint(0));
      strokeRanges = strokeRanges.concat(firstStrokeRange(lastDistance));
    } else {
      checkpoints = checkpoints.concat(subsequentLapCheckpoint(lastDistance));
      strokeRanges = strokeRanges.concat(subsequentStrokeRange(lastDistance));
    }
    lastDistance += POOL_DISTANCE;
    distanceLeft -= POOL_DISTANCE;
  }
  return {
    name: `25m Pool-${totalDistance}m`,
    checkpoints: checkpoints,
    strokeRanges: strokeRanges,
  };
}

const NAME_PREFIX = '25m Pool';

// export class Freestyle25mMode extends Pool25m {
//   constructor() {
//     super(NAME_PREFIX, 25);
//   }
// }

// export class Freestyle50mMode extends Pool25m {
//   constructor() {
//     super(NAME_PREFIX, 50);
//   }
// }

// export class Freestyle100mMode extends Pool25m {
//   constructor() {
//     super(NAME_PREFIX, 100);
//   }
// }

// export class Freestyle200mMode extends Pool25m {
//   constructor() {
//     super(NAME_PREFIX, 200);
//   }
// }

// export class Freestyle400mMode extends Pool25m {
//   constructor() {
//     super(NAME_PREFIX, 400);
//   }
// }

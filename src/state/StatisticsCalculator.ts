import {
  AnnotationInformation,
  Annotations,
  PoolDistance,
  poolDistanceToNumber,
} from './AKB';
import { StrokeCounts, StrokeRange } from './AKB/StrokeCounts';
import { AppDispatch, loadAnnotation } from './redux';
import { binarySearch } from './Util';

// Time(s) at Distance(m)
export interface TimeDistStatistic {
  time: number;
  distance: number;
}

/**
 * Gives a sorted (ascending order) of time distance statistics.
 */
function getTimeAtDistance(annotations: Annotations): Array<TimeDistStatistic> {
  const timeDistStatistics: Array<TimeDistStatistic> = [];
  for (const [key, value] of Object.entries(annotations)) {
    // console.log(`getTimeAtDistance: annotations[${key}] = ${value}`);
    timeDistStatistics.push({ time: value / 1000, distance: parseInt(key) });
  }
  timeDistStatistics.sort((a, b) => a.distance - b.distance);
  const zeroed = timeDistStatistics.map(e => ({
    time: e.time - timeDistStatistics[0].time,
    distance: e.distance,
  }));
  return zeroed;
}

// metres per second
export interface VelocityAtRangeStatistic {
  startRange: number;
  endRange: number;
  velocity: number;
}

/**
 * Computes the average velocities between adjacent time points.
 */
function computeAverageVelocities(
  timeDistStatistics: Array<TimeDistStatistic>
): Array<VelocityAtRangeStatistic> {
  if (timeDistStatistics.length < 2) {
    return [];
  }
  const velocities = [];
  // find velocity between each adjacent pair of time distance
  for (let i = 0; i + 1 < timeDistStatistics.length; i++) {
    const td1 = timeDistStatistics[i];
    const td2 = timeDistStatistics[i + 1];
    const distTravelled = td2.distance - td1.distance;
    const timeTaken = td2.time - td1.time;
    console.log(
      `computeAverageVelocities: velocity at ${td1.distance}m-${
        td2.distance
      }m is ${distTravelled / timeTaken}m/s`
    );
    velocities.push({
      startRange: td1.distance,
      endRange: td2.distance,
      velocity: distTravelled / timeTaken,
    });
  }
  return velocities;
}

export interface TurnStatistics {
  turnIns: Array<Turn>;
  turnOuts: Array<Turn>;
}

export interface Turn {
  startRange: number;
  endRange: number;
  time: number;
}

/**
 * Computes the turn times "Turn in (5m)" = 50m time minus 45m time, "Turn out (15m)" = 65m time minus 50m time.
 */
function computeTurnTimes(
  timeDistStatistics: Array<TimeDistStatistic>,
  poolDistance: PoolDistance
): TurnStatistics {
  const pdInNumber = poolDistanceToNumber(poolDistance);
  const turnIns: Array<Turn> = [];
  const turnOuts: Array<Turn> = [];
  // find velocity between each adjacent pair of time distance
  timeDistStatistics.forEach((e, i) => {
    if (e.distance % pdInNumber === 0) {
      const isTurninAvailable = i - 1 >= 0;
      const isTurnoutAvailable = i + 1 < timeDistStatistics.length;
      if (isTurninAvailable && isTurnoutAvailable) {
        const prev = timeDistStatistics[i - 1];
        const next = timeDistStatistics[i + 1];
        turnIns.push({
          startRange: prev.distance,
          endRange: e.distance,
          time: e.time - prev.time,
        });
        turnOuts.push({
          startRange: e.distance,
          endRange: next.distance,
          time: next.time - e.time,
        });
      }
    }
  });
  return { turnIns: turnIns, turnOuts: turnOuts };
}

// strokeRate: strokes per minute
export interface StrokeRateStatistic {
  startRange: number;
  endRange: number;
  strokeRate: number;
}

function computeStrokeRate(
  strokeCounts: StrokeCounts
): Array<StrokeRateStatistic> {
  const strokeRates: Array<StrokeRateStatistic> = [];
  for (const [key, scWithTime] of Object.entries(strokeCounts)) {
    const strokeRange = StrokeRange.fromString(key);
    if (strokeRange.endRange - strokeRange.startRange >= 25) {
      // this is a lap stroke count
      continue;
    }
    // converted to minutes
    const timeTaken = (scWithTime.endTime - scWithTime.startTime) / 60000;
    if (timeTaken === 0 || strokeRange.startRange === strokeRange.endRange) {
      continue;
    }
    console.log(
      `computeStrokeRate: ${strokeRange.toString()} ${
        scWithTime.strokeCount / timeTaken
      } strokes/min`
    );
    strokeRates.push({
      startRange: strokeRange.startRange,
      endRange: strokeRange.endRange,
      strokeRate: scWithTime.strokeCount / timeTaken,
    });
  }
  return strokeRates;
}

export interface StrokeCountStatistic {
  startRange: number;
  endRange: number;
  strokeCount: number;
}

function getLapStrokeCounts(
  strokeCounts: StrokeCounts
): Array<StrokeCountStatistic> {
  const lapStrokeCounts: Array<StrokeCountStatistic> = [];
  return Object.entries(strokeCounts)
    .filter(([key, scWithTime]) => {
      const strokeRange = StrokeRange.fromString(key);
      return strokeRange.endRange - strokeRange.startRange >= 25;
    })
    .map(([key, scWithTime]) => {
      const strokeRange = StrokeRange.fromString(key);
      return {
        startRange: strokeRange.startRange,
        endRange: strokeRange.endRange,
        strokeCount: scWithTime.strokeCount,
      };
    });
}

function computeStrokeCounts(
  annotations: Annotations,
  strokeRates: Array<StrokeRateStatistic>
): Array<StrokeCountStatistic> {
  const strokeCounts: Array<StrokeCountStatistic> = [];
  strokeRates.forEach(sr => {
    const { startRange, endRange, strokeRate } = sr;
    if (startRange in annotations && endRange in annotations) {
      // convert to minutes
      const timeTaken =
        (annotations[endRange] - annotations[startRange]) / 60000;
      if (timeTaken === 0) {
        return;
      }
      console.log(
        `computeStrokeCount: ${startRange}m-${endRange}m is ${
          strokeRate * timeTaken
        } `
      );
      strokeCounts.push({
        startRange: startRange,
        endRange: endRange,
        strokeCount: strokeRate * timeTaken,
      });
    }
  });
  return strokeCounts;
}

// Distance(m) per stroke
export interface DPSStatistic {
  startRange: number;
  endRange: number;
  distancePerStroke: number;
}

function computeDPS(
  strokeCounts: Array<StrokeCountStatistic>
): Array<DPSStatistic> {
  const dps: Array<DPSStatistic> = [];
  strokeCounts.forEach(sc => {
    const { startRange, endRange, strokeCount } = sc;
    if (startRange === endRange) {
      return;
    }
    console.log(
      `computeDPS: ${startRange}m-${endRange}m is ${
        (endRange - startRange) / strokeCount
      } `
    );
    dps.push({
      startRange: startRange,
      endRange: endRange,
      distancePerStroke: (endRange - startRange) / strokeCount,
    });
  });
  return dps;
}

export interface ComputedResult {
  timeAndDistances: Array<TimeDistStatistic>;
  turnTimes: TurnStatistics;
  strokeCounts: Array<StrokeCountStatistic>;
  lapStrokeCounts: Array<StrokeCountStatistic>;
  strokeRates: Array<StrokeRateStatistic>;
  averageVelocities: Array<VelocityAtRangeStatistic>;
  distancePerStroke: Array<DPSStatistic>;
}

export function computeResult(
  annotationsInfo: AnnotationInformation
): ComputedResult {
  const { annotations, strokeCounts } = annotationsInfo;
  if (
    Object.entries(annotations).length === 0 ||
    Object.entries(strokeCounts).length === 0
  ) {
    return {
      timeAndDistances: [],
      turnTimes: { turnIns: [], turnOuts: [] },
      strokeCounts: [],
      lapStrokeCounts: [],
      strokeRates: [],
      averageVelocities: [],
      distancePerStroke: [],
    };
  }
  const timeDists = getTimeAtDistance(annotations);
  const turnTimes = computeTurnTimes(
    timeDists,
    annotationsInfo.poolConfig.poolDistance
  );
  const velocities = computeAverageVelocities(timeDists);
  const sr = computeStrokeRate(strokeCounts);
  const lapSc = getLapStrokeCounts(strokeCounts);
  const scAtRange = computeStrokeCounts(annotations, sr);
  const dps = computeDPS(scAtRange);
  return {
    timeAndDistances: timeDists,
    turnTimes: turnTimes,
    strokeCounts: scAtRange,
    strokeRates: sr,
    averageVelocities: velocities,
    distancePerStroke: dps,
    lapStrokeCounts: lapSc,
  };
}

function findIndexTimestamp(a: Array<number>, num: number) {
  return binarySearch(a, e => Math.floor(e) > Math.floor(num));
}

// 1 ms is added to return as the frame time is
// the time of the end of the frame
export function nextFrameTime(
  frames: Array<number>,
  frameTime: number
): number {
  const idx = findIndexTimestamp(frames, frameTime);
  if (idx >= frames.length) {
    return frames[frames.length - 1] + 1;
  }
  if (idx < 0) {
    return frames[0] + 1;
  }
  return frames[idx] + 1;
}

export function getStartOfFrameGivenTime(
  frames: Array<number>,
  frameTime: number
): number {
  const idx = findIndexTimestamp(frames, frameTime) - 1;
  if (idx >= frames.length) {
    return frames[frames.length - 1] + 1;
  }
  if (idx < 0) {
    return frames[0] + 1;
  }
  return frames[idx] + 1;
}

export function previousFrameTime(
  frames: Array<number>,
  frameTime: number
): number {
  console.log(`prev frame time from: ${frameTime}`);
  const idx = findIndexTimestamp(frames, frameTime) - 2;
  if (idx >= frames.length) {
    return frames[frames.length - 1] + 1;
  }
  if (idx < 0) {
    return frames[0] + 1;
  }
  return frames[idx] + 1;
}

export function fixAnnotationFrameTimes(
  annotationInfo: AnnotationInformation,
  dispatch?: AppDispatch
) {
  const frames = annotationInfo.frameTimes;
  if (frames.length === 0) {
    return annotationInfo;
  }
  const updatedAnn = Object.fromEntries(
    Object.entries(annotationInfo.annotations).map(([key, value]) => [
      key,
      getStartOfFrameGivenTime(frames, value),
    ])
  );
  const updatedSc = Object.fromEntries(
    Object.keys(annotationInfo.strokeCounts).map(e => {
      let scWithTime = annotationInfo.strokeCounts[e];
      if (scWithTime === undefined) {
        console.log(`undefined scWithTime. Key: ${e}`);
        scWithTime = {
          startTime: 0,
          endTime: 0,
          strokeCount: 0,
        };
      }
      return [
        e,
        {
          ...scWithTime,
          startTime: getStartOfFrameGivenTime(frames, scWithTime.startTime),
          endTime: getStartOfFrameGivenTime(frames, scWithTime.endTime),
        },
      ];
    })
  );
  const annInfoToUpdate = {
    ...annotationInfo,
    annotations: updatedAnn,
    strokeCounts: updatedSc,
  };
  if (dispatch !== undefined) {
    dispatch(loadAnnotation(annotationInfo));
  }
  return annInfoToUpdate;
}

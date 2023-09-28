import {
  AnnotationActionTypes,
  AddAnnotationAction,
  AddStrokeCountAction,
  UpdateNameAction,
  UpdatePoolConfigAction,
  LoadAnnotationAction,
  AddFrameTimesAction,
} from '../types';
import { ANNOTATION_ACTION_TYPES } from '../actions';
import { AnnotationInformation } from '../../AKB/AnnotationKnowledgeBank';

function initState(): AnnotationInformation {
  return {
    name: '',
    poolConfig: { poolDistance: '50m', raceDistance: '100m' },
    annotations: {},
    strokeCounts: {},
    frameTimes: [],
  };
}

const initialState: AnnotationInformation = initState();

export function annotationReducer(
  state: AnnotationInformation = initialState,
  action: AnnotationActionTypes
): AnnotationInformation {
  switch (action.type) {
    case ANNOTATION_ACTION_TYPES.CLEAR_ANNOTATION: {
      return initState();
    }
    case ANNOTATION_ACTION_TYPES.CLEAR_ANNOTATION_EXCEPT_POOL_CONFIG: {
      return { ...initState(), poolConfig: { ...state.poolConfig } };
    }
    case ANNOTATION_ACTION_TYPES.ADD_ANNOTATION: {
      const { payload } = action as AddAnnotationAction;
      const { distance, timestamp } = payload;
      const copiedAnnotations = { ...state.annotations };
      copiedAnnotations[distance] = timestamp;
      return {
        ...state,
        annotations: copiedAnnotations,
      };
    }
    case ANNOTATION_ACTION_TYPES.ADD_STROKE_COUNT: {
      const { payload } = action as AddStrokeCountAction;
      const { strokeRange, scWithTime } = payload;
      const copiedStrokeCounts = { ...state.strokeCounts };
      copiedStrokeCounts[strokeRange.toString()] = scWithTime;
      return {
        ...state,
        strokeCounts: copiedStrokeCounts,
      };
    }
    case ANNOTATION_ACTION_TYPES.UPDATE_NAME: {
      const { payload } = action as UpdateNameAction;
      const { name } = payload;
      return {
        ...state,
        name: name,
      };
    }
    case ANNOTATION_ACTION_TYPES.ADD_FRAME_TIMES: {
      const { payload } = action as AddFrameTimesAction;
      const { frameTimes } = payload;
      const isAscending = frameTimes.every(
        (e, i) => i === 0 || e >= frameTimes[i - 1]
      );
      if (isAscending) {
        return {
          ...state,
          frameTimes: frameTimes,
        };
      }
      return state;
    }
    case ANNOTATION_ACTION_TYPES.UPDATE_POOL_CONFIG: {
      const { payload } = action as UpdatePoolConfigAction;
      const { poolConfig } = payload;
      return {
        ...state,
        poolConfig: poolConfig,
      };
    }
    case ANNOTATION_ACTION_TYPES.LOAD_ANNOTATION: {
      const { payload } = action as LoadAnnotationAction;
      const { annotation, name } = payload;
      if (annotation === undefined || annotation === null) {
        //console.log(
        //   `Annotation reducer error: annotation passed in was ${annotation}`
        // );
        return state;
      }
      let toReturn;
      if (annotation.name === '' && name !== '') {
        toReturn = {
          ...annotation,
          name: name,
        };
      } else {
        toReturn = {
          ...annotation,
        };
      }
      if (toReturn.frameTimes === undefined) {
        toReturn.frameTimes = [];
      }
      return toReturn;
    }
    default:
      return state;
  }
}

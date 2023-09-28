export type ClearControlsAction = {
  type: string;
};

export type SetCurrentDistanceAction = {
  type: string;
  payload: { currentDistance: number };
};

export type SetCurrentStrokeRangeAction = {
  type: string;
  payload: { sr: string };
};

export type ShowLineAction = {
  type: string;
};

export type HideLineAction = {
  type: string;
};

export type AddTimerAction = {
  type: string;
  payload: { startTime: number };
};

export type EditTimerAction = {
  type: string;
  payload: { id: number; startTime: number };
};

export type RemoveTimerAction = {
  type: string;
  payload: { id: number };
};

export type ShowAnnotationDoneAlertAction = {
  type: string;
}

export type ControlsActionTypes =
  | ClearControlsAction
  | SetCurrentDistanceAction
  | ShowLineAction
  | HideLineAction
  | AddTimerAction
  | EditTimerAction
  | RemoveTimerAction
  | SetCurrentStrokeRangeAction
  | ShowAnnotationDoneAlertAction;

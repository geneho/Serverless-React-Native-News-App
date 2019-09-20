import { TOGGLE_THEME } from './actionTypes';

export const toggleTheme = user => ({
  type: TOGGLE_THEME,
  payload: [user]
});

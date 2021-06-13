import { main, onCalendarEdit } from "./main";

declare const global: {
  [x: string]: unknown;
};

global.main = main;
global.onCalendarEdit = onCalendarEdit;

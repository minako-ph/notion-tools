import { doPost, main } from "./main";
import { createWebhook } from "./initializer";

declare const global: {
  [x: string]: unknown;
};

global.main = main;
global.doPost = doPost;
global.createWebhook = createWebhook;

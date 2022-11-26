import {
  createItem,
  deleteItem,
  getItem,
  restoreItem,
  updateItem,
  updateLabels,
} from "./controller";
import { formatCardData, formatLabelData } from "./util";
import { migrateCardsLabels } from "./initializer";

const prop = PropertiesService.getScriptProperties().getProperties();

// 固定値
export const TRELLO_KEY = prop.KEY; // TrelloAPIキー
export const TRELLO_TOKEN = prop.TOKEN; // Trelloトークン
export const BOARD_ID = prop.BOARD_ID; // TrelloボードID
export const DATABASE_ID = prop.DATABASE_ID;
export const NOTION_TOKEN = prop.NOTION_TOKEN;
export const CALLBACK_URL = prop.CALLBACK_URL;

export const main = () => {
  // createWebhook()
  migrateCardsLabels();
};

type DoPost = GoogleAppsScript.Events.DoPost;
/**
 * Trelloに変更があった時に発火するメソッド
 * @param e
 */
export const doPost = (e: DoPost) => {
  console.log(
    `📣: ----------------------- ！doPost！ ----------------------- `
  );
  const contents = JSON.parse(e.postData.contents);
  const action = contents.action;
  const translationKey = contents.action.display.translationKey;

  console.log("🐛：translationKey");
  console.log(translationKey);
  console.log("🐛：data");
  console.log(action.data);

  // action_add_label_to_card
  // action_remove_label_from_card

  switch (translationKey) {
    case "action_copy_card": {
      const data = formatCardData(action.data, false);

      createItem(
        data.title,
        data.dateJP,
        data.dt,
        data.link,
        data.listId,
        data.cardId
      );
      return;
    }
    case "action_create_card": {
      const data = formatCardData(action.data, false);

      createItem(
        data.title,
        data.dateJP,
        data.dt,
        data.link,
        data.listId,
        data.cardId
      );
      return;
    }
    case "action_renamed_card": {
      const data = formatCardData(action.data, false);
      const { id: itemId } = getItem(data.cardId);

      itemId
        ? updateItem(data.title, data.dateJP, data.dt, data.listId, itemId)
        : createItem(
            data.title,
            data.dateJP,
            data.dt,
            data.link,
            data.listId,
            data.cardId
          );
      return;
    }
    case "action_move_card_from_list_to_list": {
      const data = formatCardData(action.data, true);
      const { id: itemId } = getItem(data.cardId);

      itemId
        ? updateItem(data.title, data.dateJP, data.dt, data.listId, itemId)
        : createItem(
            data.title,
            data.dateJP,
            data.dt,
            data.link,
            data.listId,
            data.cardId
          );
      return;
    }
    case "action_archived_card": {
      const data = formatCardData(action.data, false);
      const { id: itemId } = getItem(data.cardId);
      if (!itemId) return;
      deleteItem(itemId);
      return;
    }
    case "action_sent_card_to_board": {
      const data = formatCardData(action.data, false);
      const { id: itemId } = getItem(data.cardId);

      itemId
        ? restoreItem(itemId)
        : createItem(
            data.title,
            data.dateJP,
            data.dt,
            data.link,
            data.listId,
            data.cardId
          );
      return;
    }
    case "action_add_label_to_card": {
      const data = formatLabelData(action.data);
      const { id: itemId, properties } = getItem(data.cardId);

      const currentLabels = properties.labels.multi_select;
      if (!itemId) return;

      const labels = Array.from(
        new Map(
          [{ name: data.labelName }, ...currentLabels].map((label) => [
            label.name,
            {
              name: label.name,
            },
          ])
        ).values()
      );
      updateLabels(itemId, labels);
      return;
    }
    case "action_remove_label_from_card": {
      const data = formatLabelData(action.data);
      const { id: itemId, properties } = getItem(data.cardId);

      const currentLabels = properties.labels.multi_select;
      if (!itemId) return;

      const labels = currentLabels.filter(
        (label: any) => label.name !== data.labelName
      );
      updateLabels(itemId, labels);
      return;
    }
    default:
      return;
  }
};

/** ======================================
 * initializer.ts
 * 初期設定系メソッド, main関数で呼び出すなどして使う
 ====================================== */
import {
  BOARD_ID,
  CALLBACK_URL,
  DATABASE_ID,
  NOTION_TOKEN,
  TRELLO_KEY,
  TRELLO_TOKEN,
} from "./main";
import { updateLabels } from "./controller";

/**
 * initializeItems Notionに初期データ登録
 * NOTE: 未完成
 */
export const initializeItems = () => {
  // リスト情報の取得
  const listUrl =
    "https://trello.com/1/boards/" +
    BOARD_ID +
    "/lists?key=" +
    TRELLO_KEY +
    "&token=" +
    TRELLO_TOKEN +
    "&fields=name";
  const listRes = UrlFetchApp.fetch(listUrl);
  const listJson = JSON.parse(listRes.getContentText());

  // カード情報の取得
  const apiUrl =
    "https://trello.com/1/boards/" +
    BOARD_ID +
    "/cards?key=" +
    TRELLO_KEY +
    "&token=" +
    TRELLO_TOKEN;
  const cardRes = UrlFetchApp.fetch(apiUrl);
  const cardJson = JSON.parse(cardRes.getContentText());

  console.log(listJson);
  console.log(cardJson);

  // TODO 未完成
};

/**
 * createWebhook Trelloのwebhookを作成する
 * NOTE: ボードを変更した時に初期設定として1度だけ叩く
 * !! createWebhookを叩くときはウェブアプリケーションのスコープを一旦 only me にする必要がある !!
 * Deploy as web app > Who has access to the app => Only myself
 */
export const createWebhook = () => {
  const requestUrl =
    "https://api.trello.com/1/tokens/" +
    TRELLO_TOKEN +
    "/webhooks/?key=" +
    TRELLO_KEY;
  const options = {
    method: "post",
    payload: {
      description: "Webhook of Trello",
      callbackURL: CALLBACK_URL,
      idModel: BOARD_ID,
    },
  };

  // @ts-ignore
  const result = UrlFetchApp.fetch(requestUrl, options);
  console.log(result);
};

export const migrateCardsLabels = () => {
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    Authorization: "Bearer " + NOTION_TOKEN,
    "Notion-Version": "2021-05-13",
  };

  // const data = {
  //   filter: {
  //     property: "date",
  //     date: {
  //       past_month: {},
  //     },
  //   },
  // };

  const data = {
    filter: {
      property: "labels",
      multi_select: {
        is_empty: true,
      },
    },
  };

  const options = {
    method: "POST",
    headers: headers,
    payload: JSON.stringify(data),
    muteHttpExceptions: true,
  };

  const reqUrl = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

  let notionRes;
  try {
    // @ts-ignore
    const result = UrlFetchApp.fetch(reqUrl, options);
    notionRes = JSON.parse(result.getContentText())["results"];
  } catch (e) {
    throw `${reqUrl}へのリクエストに失敗しました`;
  }

  if (!notionRes) return;

  notionRes.map((card: any) => {
    console.log(`📣: card`);
    console.log(card);

    // notion.trelloIdで詳細GET
    const reqUrl = `https://api.trello.com/1/cards/${card.properties["card id"].rich_text[0].text.content}?key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;

    let trelloRes;
    try {
      // @ts-ignore
      const result = UrlFetchApp.fetch(reqUrl);
      trelloRes = JSON.parse(result.getContentText());
      console.log("🐛debug: trelloRes detail");
      console.log(trelloRes);
    } catch (e) {
      throw `${reqUrl}へのリクエストに失敗しました`;
    }
    if (!trelloRes) return;
    const labels = trelloRes.labels.map((label: any) => ({
      name: label.name,
    }));
    // trello.labelsをNotionを更新
    updateLabels(card.id, labels);
  });
};

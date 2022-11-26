import { DATABASE_ID, NOTION_TOKEN } from "./main";

/**
 * Notionアイテムを作成する
 * @param title タイトル
 * @param dateJP 日付（日本語表記）
 * @param date 日付
 * @param link Trelloカードのリンク
 * @param listId TrelloカードのリストID
 * @param cardId TrelloカードのカードID
 */
export const createItem = (
  title: string,
  dateJP: string,
  date: string,
  link: string,
  listId: string,
  cardId: string
): void => {
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    Authorization: "Bearer " + NOTION_TOKEN,
    "Notion-Version": "2021-05-13",
  };

  const data = {
    parent: { database_id: DATABASE_ID },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      日付: {
        rich_text: [
          {
            type: "text",
            text: {
              content: dateJP,
            },
          },
        ],
      },
      date: {
        date: {
          start: date,
        },
      },
      link: {
        url: link,
      },
      "list id": {
        rich_text: [
          {
            type: "text",
            text: {
              content: listId,
            },
          },
        ],
      },
      "card id": {
        rich_text: [
          {
            type: "text",
            text: {
              content: cardId,
            },
          },
        ],
      },
    },
  };

  const options = {
    method: "POST",
    headers: headers,
    payload: JSON.stringify(data),
    muteHttpExceptions: true,
  };

  const reqUrl = `https://api.notion.com/v1/pages`;

  try {
    // @ts-ignore
    const result = UrlFetchApp.fetch(reqUrl, options);
    console.log("🐛debug: result");
    console.log(result.getContentText());
  } catch (e) {
    throw `${reqUrl}へのリクエストに失敗しました`;
  }
};

/**
 * 既存のアイテムをアップデートする
 * @param title タイトル
 * @param dateJP 日付（日本語表記）
 * @param date 日付
 * @param listId TrelloカードのリストID
 * @param itemId NotionのアイテムID
 */
export const updateItem = (
  title: string,
  dateJP: string,
  date: string,
  listId: string,
  itemId: string
): void => {
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    Authorization: "Bearer " + NOTION_TOKEN,
    "Notion-Version": "2021-05-13",
  };

  const data = {
    properties: {
      Name: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      日付: {
        rich_text: [
          {
            type: "text",
            text: {
              content: dateJP,
            },
          },
        ],
      },
      date: {
        date: {
          start: date,
        },
      },
      "list id": {
        rich_text: [
          {
            type: "text",
            text: {
              content: listId,
            },
          },
        ],
      },
    },
  };

  const options = {
    method: "PATCH",
    headers: headers,
    payload: JSON.stringify(data),
    muteHttpExceptions: true,
  };

  const reqUrl = `https://api.notion.com/v1/pages/${itemId}`;

  try {
    // @ts-ignore
    const result = UrlFetchApp.fetch(reqUrl, options);
    console.log("🐛debug: result");
    console.log(result.getContentText());
  } catch (e) {
    throw `${reqUrl}へのリクエストに失敗しました`;
  }
};

export const updateLabels = (
  itemId: string,
  labels: { name: string }[]
): void => {
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    Authorization: "Bearer " + NOTION_TOKEN,
    "Notion-Version": "2021-05-13",
  };

  const data = {
    properties: {
      labels: {
        multi_select: labels,
      },
    },
  };

  const options = {
    method: "PATCH",
    headers: headers,
    payload: JSON.stringify(data),
    muteHttpExceptions: true,
  };

  const reqUrl = `https://api.notion.com/v1/pages/${itemId}`;

  try {
    // @ts-ignore
    const result = UrlFetchApp.fetch(reqUrl, options);
    console.log("🐛debug: updateLabels result");
    console.log(result.getContentText());
    console.log("🐛debug: updateLabels payload");
    console.log(JSON.stringify(data));
  } catch (e) {
    throw `${reqUrl}へのリクエストに失敗しました`;
  }
};

/**
 * 指定されたTrelloカードIDのNotionアイテムを返す, 無ければnull
 * @param cardId TrelloカードのカードID
 */
export const getItem = (cardId: string) => {
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    Authorization: "Bearer " + NOTION_TOKEN,
    "Notion-Version": "2021-05-13",
  };

  const data = {
    filter: {
      property: "card id",
      text: {
        equals: cardId,
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

  try {
    // @ts-ignore
    const result = UrlFetchApp.fetch(reqUrl, options);
    const results = JSON.parse(result.getContentText())["results"];
    console.log("🐛debug: getIte result");
    console.log(result.getContentText());
    // NOTE: 1つしかヒットしないとして0個目の情報を返す
    return results.length > 0 ? results[0] : null;
  } catch (e) {
    throw `${reqUrl}へのリクエストに失敗しました`;
  }
};

/**
 * アイテムの削除
 * @param itemId NotionのアイテムID
 */
export const deleteItem = (itemId: string) => {
  _toggleItemDeleted(true, itemId);
};

/**
 * アイテムの復活
 * @param itemId NotionのアイテムID
 */
export const restoreItem = (itemId: string) => {
  _toggleItemDeleted(false, itemId);
};

const _toggleItemDeleted = (deleted: boolean, itemId: string) => {
  const headers = {
    "Content-Type": "application/json; charset=UTF-8",
    Authorization: "Bearer " + NOTION_TOKEN,
    "Notion-Version": "2021-05-13",
  };

  const data = {
    properties: {
      "is deleted": {
        checkbox: deleted,
      },
    },
  };

  const options = {
    method: "PATCH",
    headers: headers,
    payload: JSON.stringify(data),
    muteHttpExceptions: true,
  };

  const reqUrl = `https://api.notion.com/v1/pages/${itemId}`;

  try {
    // @ts-ignore
    const result = UrlFetchApp.fetch(reqUrl, options);
    console.log("🐛debug: result");
    console.log(result.getContentText());
  } catch (e) {
    throw `${reqUrl}へのリクエストに失敗しました`;
  }
};

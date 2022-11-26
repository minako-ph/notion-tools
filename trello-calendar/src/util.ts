import { startOfYear, set, formatRFC3339 } from "date-fns";

/**
 * 04月01日（月）なフォーマットのstringをDate型にコンバートする
 * @param dateJp 日付（日本語表記）
 */
export const convertToDateFromDateJp = (dateJp: string): Date => {
  const month = Number(dateJp.substr(0, 2)) - 1; // monthは0始まり
  const date = Number(dateJp.substr(3, 2));

  const dt = startOfYear(new Date());

  return set(dt, { month, date });
};

/**
 * Trelloのwebhook POSTで受け取ったデータの整形
 * @param data
 * @param isListUpdate リスト移動した時はデータ形式が変わるので指定する
 */
export const formatCardData = (data: any, isListUpdate: boolean) => {
  const title = data.card.name;
  const link = `https://trello.com/c/${data.card.shortLink}`;
  const cardId = data.card.id;

  const list = isListUpdate ? data.listAfter : data.list;

  const dateJP = list.name;
  const dt = formatRFC3339(convertToDateFromDateJp(dateJP));
  const listId = list.id;

  const formattedData = { title, link, cardId, dateJP, dt, listId };
  console.log("🐛 after format data");
  console.log(formattedData);

  return formattedData;
};

/**
 * Trelloのwebhook POSTで受け取ったデータの整形
 * @param data
 */
export const formatLabelData = (data: any) => {
  const cardId = data.card.id;
  const labelName = data.text;

  const formattedData = { cardId, labelName };
  console.log("🐛 after format data");
  console.log(formattedData);

  return formattedData;
};

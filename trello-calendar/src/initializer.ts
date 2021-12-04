/** ======================================
 * initializer.ts
 * 初期設定系メソッド, main関数で呼び出すなどして使う
 ====================================== */
import { BOARD_ID, CALLBACK_URL, TRELLO_KEY, TRELLO_TOKEN } from './main'

/**
 * initializeItems Notionに初期データ登録
 * NOTE: 未完成
 */
export const initializeItems = () => {
  // リスト情報の取得
  const listUrl = "https://trello.com/1/boards/" + BOARD_ID + "/lists?key=" + TRELLO_KEY + "&token=" + TRELLO_TOKEN + "&fields=name"
  const listRes = UrlFetchApp.fetch(listUrl)
  const listJson = JSON.parse(listRes.getContentText())

  // カード情報の取得
  const apiUrl = "https://trello.com/1/boards/"+ BOARD_ID +"/cards?key="+ TRELLO_KEY +"&token="+ TRELLO_TOKEN
  const cardRes = UrlFetchApp.fetch(apiUrl)
  const cardJson = JSON.parse(cardRes.getContentText())

  console.log(listJson)
  console.log(cardJson)

  // TODO 未完成
}

/**
 * createWebhook Trelloのwebhookを作成す
 * NOTE: １度しか叩かない
 * !! createWebhookを叩くときはウェブアプリケーションのスコープを一旦 only me にする必要がある !!
 */
export const createWebhook = () => {
  const requestUrl = 'https://api.trello.com/1/tokens/' + TRELLO_TOKEN + '/webhooks/?key=' + TRELLO_KEY
  const options = {
    'method' : 'post',
    'payload' : {
      'description': 'Webhook of Trello',
      'callbackURL': CALLBACK_URL,
      'idModel': BOARD_ID
    }
  }

  // @ts-ignore
  const result = UrlFetchApp.fetch(requestUrl, options)
  console.log(result)
}

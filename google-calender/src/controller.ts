import { DATABASE_ID, TOKEN } from './main'

/**
 * Notionアイテムを作成する
 * @param title タイトル
 * @param startDt 開始日時
 * @param endDt 終了日時
 * @param isAllDay 終日予定か
 * @param account アカウントタグ
 * @param eventId GoogleカレンダーのイベントID
 * @param link Googleカレンダーへのリンク
 */
export const createItem = (title: string, startDt: string, endDt: string, isAllDay: boolean, account: string, eventId: string, link: string): void => {
  const headers = {
    'Content-Type' : 'application/json; charset=UTF-8',
    'Authorization': 'Bearer '+ TOKEN,
    'Notion-Version': '2021-05-13'
  }

  const data = {
    "parent": { "database_id": DATABASE_ID },
    "properties": {
      "Name": {
        "title": [
          {
            "text": {
              "content": title
            }
          }
        ]
      },
      "start dt": {
        "date": {
          "start": startDt
        }
      },
      "end dt": {
        "date": {
          "start": endDt
        }
      },
      "account": {
        "select": {
          "name": account
        }
      },
      "is all day event": {
        "checkbox": isAllDay
      },
      "ID": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": eventId
            }
          },
        ]
      },
      "link": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": link
            }
          },
        ]
      }
    }
  }

  const options = {
    'method' : 'POST',
    'headers': headers,
    'payload' : JSON.stringify(data),
    'muteHttpExceptions': true
  }

  const reqUrl = `https://api.notion.com/v1/pages`

  // @ts-ignore
  const result = UrlFetchApp.fetch(reqUrl, options)
  console.log('🐛debug: result')
  console.log(result.getContentText())
}

/**
 * 既存のアイテムをアップデートする
 * @param title タイトル
 * @param startDt 開始日時
 * @param endDt 終了日時
 * @param isAllDay 終日予定か
 * @param itemId NotionのアイテムID
 */
export const updateItem = (title: string, startDt: string, endDt: string, isAllDay: boolean, itemId: string) => {
  const headers = {
    'Content-Type' : 'application/json; charset=UTF-8',
    'Authorization': 'Bearer '+ TOKEN,
    'Notion-Version': '2021-05-13'
  }

  const data = {
    "properties": {
      "Name": {
        "title": [
          {
            "text": {
              "content": title
            }
          }
        ]
      },
      "start dt": {
        "date": {
          "start": startDt
        }
      },
      "end dt": {
        "date": {
          "start": endDt
        }
      },
      "is all day event": {
        "checkbox": isAllDay
      },
    }
  }

  const options = {
    'method' : 'PATCH',
    'headers': headers,
    'payload' : JSON.stringify(data),
    'muteHttpExceptions': true
  }

  const reqUrl = `https://api.notion.com/v1/pages/${itemId}`

  // @ts-ignore
  const result = UrlFetchApp.fetch(reqUrl, options)
  console.log('🐛debug: result')
  console.log(result.getContentText())
}

/**
 * アイテムの削除
 * @param itemId NotionのアイテムID
 */
export const deleteItem = (itemId: string) => {
  const headers = {
    'Content-Type' : 'application/json; charset=UTF-8',
    'Authorization': 'Bearer '+ TOKEN,
    'Notion-Version': '2021-05-13'
  }

  const data = {
    "properties": {
      "is deleted": {
        "checkbox": true
      },
    }
  }

  const options = {
    'method' : 'PATCH',
    'headers': headers,
    'payload' : JSON.stringify(data),
    'muteHttpExceptions': true
  }

  const reqUrl = `https://api.notion.com/v1/pages/${itemId}`

  // @ts-ignore
  const result = UrlFetchApp.fetch(reqUrl, options)
  console.log('🐛debug: result')
  console.log(result.getContentText())
}

/**
 * getItemId
 * 指定されたカレンダーイベントIDのNotionアイテムIDを返す, 無ければnull
 * @param eventId GoogleカレンダーのイベントID
 */
export const getItemId = (eventId: string, account: string): string|null => {
  const headers = {
    'Content-Type' : 'application/json; charset=UTF-8',
    'Authorization': 'Bearer '+ TOKEN,
    'Notion-Version': '2021-05-13'
  }

  const data = {
    "filter": {
      "and": [
        {
          "property": "ID",
          "text": {
            "equals": eventId
          }
        },
        {
          "property": "account",
          "select": {
            "equals": account
          }
        }
      ]
    }
  }

  const options = {
    'method' : 'POST',
    'headers': headers,
    'payload' : JSON.stringify(data),
    'muteHttpExceptions': true
  }

  const reqUrl = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`

  // @ts-ignore
  const result = UrlFetchApp.fetch(reqUrl, options)
  const results = JSON.parse(result.getContentText())['results']

  // NOTE: 1つしかヒットしないとして0個目の情報を返す
  return results.length > 0 ? results[0]['id'] : null
}

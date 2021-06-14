import { DATABASE_ID, NOTION_TOKEN } from './main'

/**
 * Notionアイテムを作成する
 * @param title タイトル
 * @param dateJP 日付（日本語表記）
 * @param date 日付
 * @param link Trelloカードのリンク
 * @param listId TrelloカードのリストID
 * @param cardId TrelloカードのカードID
 */
export const createItem = (title: string, dateJP: string, date: string, link: string, listId: string, cardId: string): void => {
  const headers = {
    'Content-Type' : 'application/json; charset=UTF-8',
    'Authorization': 'Bearer '+ NOTION_TOKEN,
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
      "日付": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": dateJP
            }
          },
        ]
      },
      "date": {
        "date": {
          "start": date
        }
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
      },
      "list id": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": listId
            }
          },
        ]
      },
      "card id": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": cardId
            }
          },
        ]
      },
    }
  }

  const options = {
    'method' : 'POST',
    'headers': headers,
    'payload' : JSON.stringify(data),
    'muteHttpExceptions': true
  }

  const reqUrl = `https://api.notion.com/v1/pages`
  console.log('reqUrl')
  console.log(reqUrl)

  // @ts-ignore
  const result = UrlFetchApp.fetch(reqUrl, options)
  console.log('🐛debug: result')
  console.log(result.getContentText())
}

/**
 * 既存のアイテムをアップデートする
 * @param title タイトル
 * @param dateJP 日付（日本語表記）
 * @param date 日付
 * @param listId TrelloカードのリストID
 * @param itemId NotionのアイテムID
 */
export const updateItem = (title: string, dateJP: string, date: string, listId: string, itemId: string): void => {
  const headers = {
    'Content-Type' : 'application/json; charset=UTF-8',
    'Authorization': 'Bearer '+ NOTION_TOKEN,
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
      "日付": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": dateJP
            }
          },
        ]
      },
      "date": {
        "date": {
          "start": date
        }
      },
      "list id": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": listId
            }
          },
        ]
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
  console.log('reqUrl')
  console.log(reqUrl)

  // @ts-ignore
  const result = UrlFetchApp.fetch(reqUrl, options)
  console.log('🐛debug: result')
  console.log(result.getContentText())
}

/**
 * 指定されたTrelloカードIDのNotionアイテムを返す, 無ければnull
 * @param listId TrelloカードのリストID
 * @param cardId TrelloカードのカードID
 */
export const getItemId = (listId: string, cardId: string): string|null => {
  const headers = {
    'Content-Type' : 'application/json; charset=UTF-8',
    'Authorization': 'Bearer '+ NOTION_TOKEN,
    'Notion-Version': '2021-05-13'
  }

  const data = {
    "filter": {
      "and": [
        {
          "property": "list id",
          "text": {
            "equals": listId
          }
        },
        {
          "property": "card id",
          "text": {
            "equals": cardId
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
  console.log('reqUrl')
  console.log(reqUrl)

  // @ts-ignore
  const result = UrlFetchApp.fetch(reqUrl, options)
  const results = JSON.parse(result.getContentText())['results']

  // NOTE: 1つしかヒットしないとして0個目の情報を返す
  return results.length > 0 ? results[0]['id'] : null
}

/**
 * アイテムの削除
 * @param itemId NotionのアイテムID
 */
export const deleteItem = (itemId: string) => {
  _toggleItemDeleted(true, itemId)
}

/**
 * アイテムの復活
 * @param itemId NotionのアイテムID
 */
export const restoreItem = (itemId: string) => {
  _toggleItemDeleted(false, itemId)
}

const _toggleItemDeleted = (deleted: boolean, itemId: string) => {
  const headers = {
    'Content-Type' : 'application/json; charset=UTF-8',
    'Authorization': 'Bearer '+ NOTION_TOKEN,
    'Notion-Version': '2021-05-13'
  }

  const data = {
    "properties": {
      "is deleted": {
        "checkbox": deleted
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
  console.log('reqUrl')
  console.log(reqUrl)

  // @ts-ignore
  const result = UrlFetchApp.fetch(reqUrl, options)
  console.log('🐛debug: result')
  console.log(result.getContentText())
}


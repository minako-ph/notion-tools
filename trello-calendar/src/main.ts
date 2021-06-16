import { createItem, deleteItem, getItemId, restoreItem, updateItem } from './controller'
import { formatData } from './util'

const prop = PropertiesService.getScriptProperties().getProperties()

// 固定値
export const TRELLO_KEY   = prop.KEY  // TrelloAPIキー
export const TRELLO_TOKEN = prop.TOKEN // Trelloトークン
export const BOARD_ID = prop.BOARD_ID // TrelloボードID
export const DATABASE_ID = prop.DATABASE_ID
export const NOTION_TOKEN = prop.NOTION_TOKEN
export const CALLBACK_URL = prop.CALLBACK_URL

export const main = () => {
}

type DoPost = GoogleAppsScript.Events.DoPost
/**
 * Trelloに変更があった時に発火するメソッド
 * @param e
 */
export const doPost = (e: DoPost) => {
  const contents = JSON.parse(e.postData.contents)
  const action = contents.action
  const translationKey = contents.action.display.translationKey

  console.log('🐛：translationKey')
  console.log(translationKey)

  switch (translationKey) {
    case 'action_create_card': {
      const data = formatData(action.data, false)
      createItem(data.title, data.dateJP, data.dt, data.link, data.listId, data.cardId)
      return
    }
    case 'action_renamed_card': {
      const data = formatData(action.data, false)
      const itemId = getItemId(data.listId, data.cardId)

      itemId
        ? updateItem(data.title, data.dateJP, data.dt, data.listId, itemId)
        : createItem(data.title, data.dateJP, data.dt, data.link, data.listId, data.cardId)
      return
    }
    case 'action_move_card_from_list_to_list': {
      const data = formatData(action.data, true)
      const beforeListId = action.data.listBefore.id
      const itemId = getItemId(beforeListId, data.cardId)

      itemId
        ? updateItem(data.title, data.dateJP, data.dt, data.listId, itemId)
        : createItem(data.title, data.dateJP, data.dt, data.link, data.listId, data.cardId)
      return
    }
    case 'action_archived_card': {
      const data = formatData(action.data, false)
      const itemId = getItemId(data.listId, data.cardId)
      if (!itemId) return
      deleteItem(itemId)
      return
    }
    case 'action_sent_card_to_board': {
      const data = formatData(action.data, false)
      const itemId = getItemId(data.listId, data.cardId)

      itemId ? restoreItem(itemId) : createItem(data.title, data.dateJP, data.dt, data.link, data.listId, data.cardId)
      return
    }
    default:
      return
  }
}

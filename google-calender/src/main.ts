import { getAccountTag } from './util'
import { createItem, deleteItem, getItemId, updateItem } from './controller'
import { endOfDay, formatRFC3339, startOfDay, sub } from 'date-fns'

const props = PropertiesService.getScriptProperties().getProperties()
export const TOKEN = props.TOKEN
export const DATABASE_ID = props.DATABASE_ID
export const CALENDAR_ID_A = props.CALENDAR_ID_A
export const CALENDAR_ID_B = props.CALENDAR_ID_B
export const CALENDAR_NAME_A = props.CALENDAR_NAME_A
export const CALENDAR_NAME_B = props.CALENDAR_NAME_B

export const main = () => {
}

type CalendarEvent = {
  authMode: string
  calendarId: string
  triggerUid: string
}

/**
 * カレンダーに変更があった時に発火するメソッド
 * @param e
 */
export const onCalendarEdit = (e: CalendarEvent) => {
  // 受け取ったイベントからカレンダーIDの取得
  const calendarId = e.calendarId

  // 保存していた差分同期トークンの取得
  const properties = PropertiesService.getScriptProperties()
  const nextSyncToken = properties.getProperty("syncToken")

  const events = Calendar.Events
  if (!events) throw 'イベントの取得に失敗しました'

  // 差分同期トークンをオプションに付けることで差分同期を行う
  const items = events.list(calendarId, { syncToken: nextSyncToken })

  // 次回使用する差分同期トークンを保存
  const newNextSyncToken = items.nextSyncToken
  if (!newNextSyncToken) throw '同期トークンの取得に失敗しました'
  properties.setProperty("syncToken", newNextSyncToken)

  // アカウントの取得
  const account = getAccountTag(calendarId) || '取得失敗'

  for (const item of items.items || []) {
    console.log('🐛debug: item')
    console.log(item)

    // NOTE: 後に意図せぬ重複の特定を防ぐため取得失敗時はユニークなstrを付与する
    const eventId = item['id'] || `取得失敗-${new Date().toISOString()}`

    if (item['status'] === 'confirmed') {
      // イベント各情報の取得
      const title = item['summary'] || '取得失敗'

      // TODO データの整形処理をinitializeItemsと共通化する
      const startDt =
        item['start'] && typeof item['start'].dateTime !== 'undefined'
          ? item['start'].dateTime
          : formatRFC3339(startOfDay(new Date(item['start'].date)))
      const endDt =
        item['end'] && typeof item['end'].dateTime !== 'undefined'
          ? item['end'].dateTime
          : formatRFC3339(sub(endOfDay(new Date(item['end'].date)), {days: 1}))
      const isAllDay =
        item['start'] && typeof item['start'].date !== 'undefined'
          ? true
          : false // NOTE: dateが返される時は終日予定

      const link = item['htmlLink'] || ''

      // アイテムが既に存在していたらupdate, 無ければcreate
      const itemId = getItemId(eventId, account)

      itemId
        ? updateItem(title, startDt, endDt, isAllDay, itemId)
        : createItem(title, startDt, endDt, isAllDay, account, eventId, link)
    }
    if (item['status'] === 'cancelled') {
      // 削除されたアイテムのIDを検索して削除
      const itemId = getItemId(eventId, account)
      if (!itemId) continue
      deleteItem(itemId)
    }
  }
}

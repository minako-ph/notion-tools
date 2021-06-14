/** ======================================
 * initializer.ts
 * 初期設定系メソッド, main関数で呼び出すなどして使う
 ====================================== */
import { add, endOfDay, formatRFC3339, startOfDay, startOfMonth, sub } from 'date-fns'
import { getAccountTag } from './util'
import { createItem, getItemId, updateItem } from './controller'

/**
 * initialSync カレンダーの初期同期
 * NOTE: 初回しか使わない想定
 * @param calendarId GoogleカレンダーのイベントID
 */
// @ts-ignore 呼び出されてなくても無視
export const initialSync = (calendarId: string) => {
  const events = Calendar.Events
  if (!events) throw 'イベントの取得に失敗しました'

  // 初期同期 // NOTE: timeMinは最後のページに存在するnextSyncTokenを取るための暫定対応
  const timeMin = startOfDay(new Date(2021, 6, 1)).toISOString()
  const items = events.list(calendarId, { timeMin: timeMin })

  // 次回使用する差分同期トークンを保存
  const nextSyncToken = items.nextSyncToken
  if (!nextSyncToken) throw '同期トークンの取得に失敗しました'

  const properties = PropertiesService.getScriptProperties()
  properties.setProperty("syncToken", nextSyncToken)
}

/**
 * initializeItems Notionに初期データ登録
 * NOTE: 初回しか使わない想定, 重複判定もしてるので全アイテムに対する更新も可能だが期間を確認する
 * @param calendarId GoogleカレンダーのイベントID
 */
// @ts-ignore 呼び出されてなくても無視
export const initializeItems = (calendarId: string) => {
  const events = Calendar.Events
  if (!events) throw 'イベントの取得に失敗しました'

  // 取得期間の生成
  const startDt = startOfMonth(new Date())
  const timeMin = formatRFC3339(startDt)
  const endDt = add(startOfMonth(new Date()), {months: 6})
  const timeMax = formatRFC3339(endDt)

  // イベントの取得
  const items = events.list(
    calendarId,
    {
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 9999,
      timeZone: 'Asia/Tokyo',
      orderBy: 'startTime',
      singleEvents: true
    }
  )
  if (!items) throw 'イベントが見つかりませんでした'


  // アカウントの取得
  const account = getAccountTag(calendarId) || '取得失敗'

  for (const item of items.items || []) {
    // NOTE: 後に意図せぬ重複の特定を防ぐため取得失敗時はユニークなstrを付与する
    const eventId = item['id'] || `取得失敗-${new Date().toISOString()}`

    if (item['status'] === 'confirmed') {
      const title = item['summary'] || '取得失敗'

      // TODO データの整形処理をonCalendarEditと共通化する
      // @ts-ignore GoogleカレンダーAPIの仕様的にdateTimeかdateどちらかしかundefにならない
      const startDt = typeof item['start'].dateTime !== 'undefined' ? item['start'].dateTime : formatRFC3339(startOfDay(new Date(item['start'].date as string)))
      // @ts-ignore GoogleカレンダーAPIの仕様的にdateTimeかdateどちらかしかundefにならない
      const endDt = typeof item['end'].dateTime !== 'undefined' ? item['end'].dateTime : formatRFC3339(sub(endOfDay(new Date(item['end'].date as string)), {days: 1}))
      // @ts-ignore GoogleカレンダーAPIの仕様的にdateTimeかdateどちらかしかundefにならない
      const isAllDay = typeof item['start'].date !== 'undefined' ? true : false // NOTE: dateが返される時は終日予定

      const link = item['htmlLink'] || ''

      // アイテムが既に存在していたらupdate, 無ければcreate
      const itemId = getItemId(eventId, account)

      itemId
        ? updateItem(title, startDt, endDt, isAllDay, itemId)
        : createItem(title, startDt, endDt, isAllDay, account, eventId, link)
    }
  }
}


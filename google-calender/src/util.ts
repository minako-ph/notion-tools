import {
  CALENDAR_ID_A,
  CALENDAR_ID_B,
  CALENDAR_ID_C,
  CALENDAR_NAME_A,
  CALENDAR_NAME_B,
  CALENDAR_NAME_C,
} from './main'

/**
 * カレンダーIDに対応するアカウントタグの取得
 * @param calenderId カレンダーID
 */
export const getAccountTag = (calenderId: string): string|null => {
  switch (calenderId) {
    case CALENDAR_ID_A:
      return CALENDAR_NAME_A || null
    case CALENDAR_ID_B:
      return CALENDAR_NAME_B || null
    case CALENDAR_ID_C:
      return CALENDAR_NAME_C || null
    default:
      return null
  }
}

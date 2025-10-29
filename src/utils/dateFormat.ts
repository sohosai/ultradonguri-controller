/**
 * ISO 8601形式の日付文字列から月-日を抽出します
 * @param isoString ISO 8601形式の日付文字列 (例: "2025-11-01T09:00:00+09:00")
 * @returns MM-DD形式の文字列 (例: "11-01")
 */
export const formatToMonthDay = (isoString: string): string => {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}-${day}`;
};

/**
 * ISO 8601形式の日付文字列から時:分を抽出します
 * @param isoString ISO 8601形式の日付文字列 (例: "2025-11-01T09:00:00+09:00")
 * @returns hh:mm形式の文字列 (例: "09:00")
 */
export const formatToHourMinute = (isoString: string): string => {
  const date = new Date(isoString);
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
};

/**
 * ISO 8601形式の日付文字列から YYYY-MM-DD を抽出します（ローカルタイム基準）
 * @param isoString ISO 8601形式の日付文字列
 * @returns YYYY-MM-DD 形式の文字列
 */
export const formatToYmd = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

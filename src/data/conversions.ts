import type { Conversion } from "../types/performances";

// 全てのconversionで共通の表示データ
const CONVERSION_DATA = {
  title: "転換",
  description: "次のパフォーマンスの準備中です",
};

// 指定されたindexのconversionを取得（一意のIDを持つ）
export const getConversion = (index: number): Conversion => ({
  id: `conversion-${index}`,
  ...CONVERSION_DATA,
});

/**
 * レシピカードの型定義
 * 初期データ構造に基づく
 */
export interface Recipe {
  /** レシピID（例: "r001"） */
  id: string;
  /** 料理名 */
  name: string;
  /** 画像URL */
  image_url: string;
  /** タグ（例: ["肉料理", "15分", "定番"]） */
  tags: string[];
  /** カテゴリ（main, side, soup等） */
  category: string;
  /** 説明文 */
  description: string;
  /** 検索クエリ（Google検索用） */
  search_query: string;
}

/**
 * レシピデータの配列型
 */
export type RecipeList = Recipe[];


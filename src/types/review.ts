// export type ReviewCategory = "meal" | "drink" | "shop";

// export interface RatingReviewItem {
//   id: string;
//   name: string;
//   imageUrl: string;
//   category: ReviewCategory;
//   categoryLabel: string;
//   rating: number;
//   date: string; // display-formatted, e.g. "១១/០១/២០២៦"
//   description: string;
// }
export type ReviewCategory = "meal" | "drink" | "shop";

export interface RatingReviewItem {
  id: string;
  name: string;
  imageUrl: string;
  category: ReviewCategory;
  categoryLabel: string;
  rating: number;
  date: string; // display-formatted, e.g. "១១/០១/២០២៦"
  sortDate: string; // ISO yyyy-mm-dd, used for actual oldest/newest sorting
  description: string;
}
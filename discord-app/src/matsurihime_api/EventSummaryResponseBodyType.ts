/**
 * ミリシタのイベント情報を取得するAPIのレスポンスの型
 *
 * @link https://api.matsurihi.me/api/mltd/v2/events/:eventId
 */
export type EventSummaryResponseBodyType = {
  id: number;
  type: number;
  appealType: number;
  name: string;
  schedule: {
    beginAt: Date;
    endAt: Date;
    pageOpenedAt: Date;
    pageClosedAt: Date;
    boostBeginAt: Date | null;
    boostEndAt: Date | null;
  };
  item: {
    name: string | null;
    shortName: string | null;
  };
};

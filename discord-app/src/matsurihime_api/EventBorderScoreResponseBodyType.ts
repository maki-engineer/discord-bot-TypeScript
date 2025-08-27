/**
 * ミリシタのイベントの現在のボーダースコアを取得するAPIのレスポンスの型
 *
 * @link https://api.matsurihi.me/api/mltd/v2/events/:eventId/rankings/borderPoints
 */
export type EventBorderScoreResponseBodyType = {
  eventPoint: {
    scores: {
      rank: number;
      score: number;
    }[];
    aggregatedAt: Date;
    updatedAt: Date;
    count: number;
  };
  idolPoint: [
    {
      idolId: number;
      scores: {
        rank: number;
        score: number;
      }[];
      aggregatedAt: Date;
      updatedAt: Date;
    },
  ];
};

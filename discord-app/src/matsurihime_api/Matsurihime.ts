import axios from 'axios';
import { EventBorderScoreResponseBodyType } from './EventBorderScoreResponseBodyType';
import { EventSummaryResponseBodyType } from './EventSummaryResponseBodyType';

/**
 * まつり姫APIを使って、定期的にイベントのボーダースコアを取得するためのクラス
 */
export default class Matsurihime {
  static borderScoreFor2500: number;

  /**
   * 最新のイベント情報を取得
   *
   * @param {number[]} type イベントの種類
   *
   * @throws {Error} リクエスト上限に達した場合
   *
   * @return {Promise<EventSummaryResponseBodyType[]>}
   */
  static async getLatestEventSummary(type: number[] = []) {
    const params: { params: { orderBy: string; type?: string } } = {
      params: { orderBy: 'beginAt!' },
    };

    if (type.length !== 0) {
      params.params.type = type.join(',');
    }

    try {
      const response = await axios.get<EventSummaryResponseBodyType[]>(
        'https://api.matsurihi.me/api/mltd/v2/events',
        params,
      );

      return response.data[0];
    } catch (e) {
      throw new Error('リクエスト上限に達しました。');
    }
  }

  /**
   * 現在のボーダースコアを取得
   *
   * @param {number} latestEventId 最新のイベントのID
   *
   * @throws {Error} リクエスト上限に達した場合
   *
   * @return {Promise<EventBorderScoreResponseBodyType[]>}
   */
  static async getLatestEventBorderScore(latestEventId: number) {
    try {
      const response = await axios.get<EventBorderScoreResponseBodyType>(
        `https://api.matsurihi.me/api/mltd/v2/events/${latestEventId}/rankings/borderPoints`,
      );

      return response.data;
    } catch (e) {
      throw new Error('リクエスト上限に達しました。');
    }
  }
}

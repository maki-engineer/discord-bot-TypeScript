import { TextChannel } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';
import getTodayDateList from './getTodayDateList';

/**
 * 10時に周年祝い（ミリオンライブ）
 *
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default (client: DiscordBotType) => {
  const todayDateList = getTodayDateList();
  const anniversaryDataForMillionLive = {
    name: '235プロダクション',
    year: 2020,
    month: 12,
    date: 24,
  };

  if (
    todayDateList.todayMonth !== anniversaryDataForMillionLive.month ||
    todayDateList.todayDate !== anniversaryDataForMillionLive.date
  ) {
    return;
  }

  const targetMessage = client.channels.cache.get(client.channelIdFor235ChatPlace) as TextChannel;

  targetMessage
    .send(
      // eslint-disable-next-line no-irregular-whitespace
      `本日${todayDateList.todayMonth}月${todayDateList.todayDate}日で**${anniversaryDataForMillionLive.name}**は**${Number(todayDateList.todayYear - anniversaryDataForMillionLive.year)}周年**を迎えます！！\nHappy Birthday♪　アイマス最高！！！`,
    )
    .catch(() => {});
};

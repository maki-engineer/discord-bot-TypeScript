import { TextChannel } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 現在日時を取得
 *
 * @return {object}
 */
const getTodayDateList = () => {
  const today = new Date();

  return {
    todayYear: today.getFullYear(),
    todayMonth: today.getMonth() + 1,
    todayDate: today.getDate(),
    todayHour: today.getHours(),
    todayMin: today.getMinutes(),
  };
};

/**
 * 10時に周年祝い（235プロダクション）
 *
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default (client: DiscordBotType) => {
  const todayDateList = getTodayDateList();
  const anniversaryDataFor235Production = {
    name: '『アイドルマスター ミリオンライブ！ シアターデイズ』',
    year: 2017,
    month: 6,
    date: 29,
  };

  if (
    todayDateList.todayMonth !== anniversaryDataFor235Production.month ||
    todayDateList.todayDate !== anniversaryDataFor235Production.date
  ) {
    return;
  }

  const targetMessage = client.channels.cache.get(client.channelIdFor235ChatPlace) as TextChannel;

  targetMessage
    .send(
      // eslint-disable-next-line no-irregular-whitespace
      `本日${todayDateList.todayMonth}月${todayDateList.todayDate}日で**${anniversaryDataFor235Production.name}**が設立されて**${Number(todayDateList.todayYear - anniversaryDataFor235Production.year)}年**が経ちました！！\nHappy Birthday♪　これからも235プロがずっと続きますように♪`,
    )
    .catch(() => {});
};

import { Message, TextChannel } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 指定された配列の中に重複している要素があるかチェック
 *
 * @param {string[]} targetList 配列
 *
 * @return {boolean}
 */
const isExistsSameValue = (targetList: string[]) => {
  const set = new Set(targetList);

  return set.size !== targetList.length;
};

/**
 * 235menコマンド 男子会の日程を決める文章を作成
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {string} commandName 入力されたコマンド名
 * @param {string[]} commandList 引数一覧
 */
export default async (
  message: Message,
  client: DiscordBotType,
  commandName: string,
  commandList: string[],
) => {
  if (commandName !== 'men' || message.author.id !== client.userIdForUtatane) return;

  const setTimeoutSec = 15_000;

  if (commandList.length < 1 || commandList.length > 10) {
    await message.reply(
      '235menコマンドは、235士官学校の日程を決めるために使用するコマンドです。\n開校したい日程を**半角スペースで区切って**入力してください。（半角数字のみ、月、曜日などは不要）\n入力できる日程の数は**2～10個まで**です！\n\n235men 8 12 15 21',
    );

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  const isAllInt = commandList.every((date) => Number.isInteger(Number(date)));

  if (!isAllInt) {
    await message.reply(
      '半角数字以外が含まれています！\n日程は**半角数字のみ**で入力してください！',
    );

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  if (isExistsSameValue(commandList)) {
    await message.reply('同じ日程が入力されています！');

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  const today = new Date();
  const lastDateTime = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  // 今月末日を取得
  const lastDate = lastDateTime.getDate();

  const isValidDate = commandList.every((date) => Number(date) >= 1 && Number(date) <= lastDate);

  if (!isValidDate) {
    await message.reply(`日は1～${lastDate}の間で入力してください！`);

    setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);

    return;
  }

  commandList.sort((a, b) => Number(a) - Number(b));

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const eventDayList = commandList.map((date) =>
    new Date(todayYear, todayMonth - 1, Number(date)).getDay(),
  );

  const week = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];

  const textList = [
    [
      `ふみこ男子の皆様方～～～～～～～～～～～！${todayMonth}月期の235士官学校開校日を決めたいと思いますわ～～～～～！！！日程なんですけど、\n\n`,
      `ふみこ男子の皆様方～～～～～～～～～！${todayMonth}月期の235士官学校開校日を決めたいと思います！その日程なんですけど、\n\n`,
    ],
    [
      '\n誠に勝手ながらこのいずれかの日程でやろうと思いますので、スタンプで反応を頂けると嬉しいです～～～～ふみこ男子の皆様方！よろしくおねがいしますわね！！！！！！！！！ﾍｹｯ!!!!!!!!',
      '\n真に勝手ながらこのいずれかにしようと思いますので、2~3日中にスタンプで反応を頂けると幸いです！よろしくお願いしま～～～～～～～す🙏',
    ],
  ];

  const maleEventEmojiList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  let eventText = `@everyone\n${textList[0][Math.floor(Math.random() * textList[0].length)]}`;

  for (let i = 0; i < commandList.length; i += 1) {
    // eslint-disable-next-line no-irregular-whitespace
    eventText += `**${todayMonth}月${commandList[i]}日 （${week[eventDayList[i]]}）…　${maleEventEmojiList[i]}**\n`;
  }

  eventText += textList[1][Math.floor(Math.random() * textList[1].length)];

  await (message.channel as TextChannel).send(eventText);

  client.usedMaleEventCommandReactionCount = commandList.length;

  setTimeout(
    () => message.reply('うたたねさん、今回もお疲れ様です！\nいつもありがとうございます♪'),
    6_000,
  );

  setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);
};

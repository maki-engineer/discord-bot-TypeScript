import { Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 235helpコマンド 235botの機能一覧を教える
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {string} commandName 入力されたコマンド名
 */
export default async (message: Message, client: DiscordBotType, commandName: string) => {
  if (commandName !== 'help') return;

  const setTimeoutSec = 15_000;

  switch (message.author.id) {
    case client.userIdForUtatane:
      await message.reply(
        '235botは以下のようなコマンドを使用することが出来ます。\n\n・235birthday\n毎月開催されるオンライン飲み会の企画文章を作成することが出来ます。コマンドを使用するときは、開催したい月、日程、時間の**3つ**を**半角数字のみ**、**半角スペースで区切って**入力してください。\n\n235birthday 12 14 21\n\n・235men\n毎月開催される235士官学校🌹の日程を決める文章を作成することが出来ます。コマンドを使用するときは、開催したい日程を**2～10個**、**半角数字のみ**で入力してください。\n\n235men 12 14 16 17\n\n・235roomdivision\n【雑談１】ボイスチャンネルに参加しているメンバーが10以上になったときに、部屋を分けることが出来ます。\nなお、【雑談１】ボイスチャンネルに参加しているメンバーが**10人未満**のときは分けることが出来ません。また、235roomdivisionコマンドは、【雑談１】ボイスチャンネルに参加しているメンバーのみが使用できます。\n\n235botはスラッシュコマンド（**/**）にも対応しています。スラッシュコマンドを使用することで、テキストの読み上げ機能などを利用することが出来ます。',
      );

      setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);
      break;

    default:
      await message.reply(
        '235botは以下のようなコマンドを使用することが出来ます。\n\n・235roomdivision\n【雑談１】ボイスチャンネルに参加しているメンバーが10以上になったときに、部屋を分けることが出来ます。\nなお、【雑談１】ボイスチャンネルに参加しているメンバーが**10人未満**のときは分けることが出来ません。また、235roomdivisionコマンドは、【雑談１】ボイスチャンネルに参加しているメンバーのみが使用できます。\n\n235botはスラッシュコマンド（**/**）にも対応しています。スラッシュコマンドを使用することで、テキストの読み上げ機能などを利用することが出来ます。',
      );

      setTimeout(() => message.delete().catch(() => {}), setTimeoutSec);
      break;
  }
};

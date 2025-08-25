import { Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 235プロダクションに新しく入ってきた方に挨拶
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (message: Message, client: DiscordBotType) => {
  if (message.channelId !== client.channelIdFor235Introduction) return;

  const makiUser = client.users.cache.get(client.userIdForMaki)!;

  await message.react('<:_Stmp_Tsubasa:794969154817753088>');
  await message.reply(
    `${message.author.globalName!}さん、235プロダクションへようこそ！\nこれからもよろしくおねがいします♪`,
  );
  await makiUser.send(
    `${message.author.globalName!}さんが新しく235プロダクションに参加されました！`,
  );
};

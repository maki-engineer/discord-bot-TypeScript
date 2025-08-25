import { Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';
import DeleteMessageRepository from '../../../repositories/DeleteMessageRepository';

/**
 * 雑談場（通話外）の235botのリプライじゃないメッセージを保存（１週間後に消すため）
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (message: Message, client: DiscordBotType) => {
  if (client.channels.cache.get(client.channelIdFor235ChatPlace) === undefined) return;
  if (
    message.channelId !== client.channelIdFor235ChatPlace ||
    !message.author.bot ||
    message.mentions.repliedUser !== null
  ) {
    return;
  }

  const today = new Date();
  const storeDate = today.getDate();

  await DeleteMessageRepository.storeMessage(message.id, storeDate);
};

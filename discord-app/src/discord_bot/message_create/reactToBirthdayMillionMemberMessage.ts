import { Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * ミリオンメンバーの誕生日をお祝いしてるメッセージにアクション
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (message: Message, client: DiscordBotType) => {
  if (client.celebrateMillionMemberReactionEmoji === '') return;

  await message.react(client.celebrateMillionMemberReactionEmoji);

  client.celebrateMillionMemberReactionEmoji = '';
};

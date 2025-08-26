import { Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 235メンバーの誕生日をお祝いしてるメッセージにアクション
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default (message: Message, client: DiscordBotType) => {
  if (client.isReactionCelebrate235MemberMessage) return;

  const birthday235MemberEmojiList = ['<:__:794969172630044674>', '<:__:794969688982552607>'];

  birthday235MemberEmojiList.forEach((emoji: string) => message.react(emoji));

  client.isReactionCelebrate235MemberMessage = true;
};

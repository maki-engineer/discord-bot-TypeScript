import { Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 235メンバーの誕生日をお祝いしてるメッセージにアクション
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (message: Message, client: DiscordBotType) => {
  if (client.isReactionCelebrate235MemberMessage) return;

  const birthday235MemberEmojiList = ['<:__:794969172630044674>', '<:__:794969688982552607>'];

  await Promise.all(
    birthday235MemberEmojiList.map((emoji) => message.react(emoji).catch(() => {})),
  );

  client.isReactionCelebrate235MemberMessage = true;
};

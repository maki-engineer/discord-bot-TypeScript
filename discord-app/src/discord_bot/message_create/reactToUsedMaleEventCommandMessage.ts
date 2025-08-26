import { Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * イベント企画で作成した文章にアクション
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (message: Message, client: DiscordBotType) => {
  if (client.usedMaleEventCommandReactionCount === 0) return;

  const maleEventEmojiList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  const reactEmojiList = maleEventEmojiList.slice(0, client.usedMaleEventCommandReactionCount);
  await Promise.all(reactEmojiList.map((emoji) => message.react(emoji).catch(() => {})));

  client.usedMaleEventCommandReactionCount = 0;
};

import { Message } from 'discord.js';
import { DiscordBotType } from '../DiscordBotType';

/**
 * イベント企画で作成した文章にアクション
 *
 * @param {Message} message Messageクラス
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default (message: Message, client: DiscordBotType) => {
  if (client.usedMaleEventCommandReactionCount === 0) return;

  const maleEventEmojiList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  for (let i = 0; i < client.usedMaleEventCommandReactionCount; i += 1) {
    message.react(maleEventEmojiList[i]).catch(() => {});
  }

  client.usedMaleEventCommandReactionCount = 0;
};

import { Message } from 'discord.js';

/**
 * 235botのメッセージがリプライだった場合、1分後に削除
 *
 * @param {Message} message Messageクラス
 */
export default (message: Message) => {
  if (!message.author.bot || !message.mentions.repliedUser) return;

  setTimeout(() => message.delete(), 60_000);
};

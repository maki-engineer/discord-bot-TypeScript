import { Message } from 'discord.js';

/**
 * 235botのメッセージがリプライだった場合、5分後に削除
 *
 * @param {Message} message Messageクラス
 */
export default (message: Message) => {
  if (message.author.bot && message.mentions.repliedUser) {
    setTimeout(() => message.delete(), 300_000);
  }
};

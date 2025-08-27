import { ColorResolvable, EmbedBuilder, TextChannel } from 'discord.js';
import Matsurihime from '../../matsurihime_api/Matsurihime';
import { DiscordBotType } from '../DiscordBotType';

/**
 * 開催中のイベントがブースト期間に入ったらお知らせ
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {string} channelId 送信対象のチャンネルID
 */
export default async (client: DiscordBotType, channelId: string) => {
  try {
    const latestEventSummary = await Matsurihime.getLatestEventSummary();

    const formatBoostBeginAt = String(latestEventSummary.schedule.boostBeginAt).replace(
      '+09:00',
      '',
    );
    const eventBoostBeginAt = new Date(formatBoostBeginAt);
    const utcDateNow = new Date();
    const jstDateNow = new Date(utcDateNow.getTime() + 9 * 60 * 60 * 1000);

    if (
      jstDateNow.getMonth() + 1 === eventBoostBeginAt.getMonth() + 1 &&
      jstDateNow.getDate() === eventBoostBeginAt.getDate() &&
      jstDateNow.getHours() === eventBoostBeginAt.getHours() &&
      jstDateNow.getMinutes() === eventBoostBeginAt.getMinutes()
    ) {
      let embedColor = '#00FF99';

      switch (latestEventSummary.appealType) {
        case 1:
          embedColor = '#FF69B4';
          break;
        case 2:
          embedColor = '#0000FF';
          break;
        case 3:
          embedColor = '#FFFF00';
          break;
      }

      const targetChannel = client.channels.cache.get(channelId) as TextChannel;

      const embed = new EmbedBuilder()
        .setTitle('ブースト期間に入りました！')
        .setAuthor({
          name: '235bot',
          iconURL: 'https://drive.google.com/uc?export=view&id=1zo-zZWNo47kh9HRzSZSKQynn5C8tv7Oh',
        })
        .addFields({ name: '\u200B', value: '\u200B' })
        .addFields({ name: 'イベント名', value: `**${latestEventSummary.name}**` })
        .setColor(embedColor as ColorResolvable);

      await targetChannel.send({ embeds: [embed] });
    }
  } catch (e) {
    // リクエスト上限に達した場合は何もしない
    // TODO: 動作確認が一通り終わったら↓↓は削除する
    console.error(e);
  }
};

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
      const embedColorMap: { [key: number]: ColorResolvable } = {
        1: '#FF69B4',
        2: '#0000FF',
        3: '#FFFF00',
      };

      const embedColor = embedColorMap[latestEventSummary.appealType] ?? '#00FF99';

      const targetChannel = client.channels.cache.get(channelId) as TextChannel;

      const embed = new EmbedBuilder()
        .setTitle('ブースト期間に入りました！')
        .setAuthor({
          name: '235bot',
          iconURL: 'https://drive.google.com/uc?export=view&id=1zo-zZWNo47kh9HRzSZSKQynn5C8tv7Oh',
        })
        .addFields({ name: '\u200B', value: '\u200B' })
        .addFields({ name: 'イベント名', value: `**${latestEventSummary.name}**` })
        .addFields({ name: '\u200B', value: '\u200B' })
        .setColor(embedColor)
        .setFooter({ text: '『アイドルマスター ミリオンライブ! シアターデイズ』ボーダー情報' })
        .setTimestamp();

      await targetChannel.send({ embeds: [embed] });
    }
  } catch (e) {
    // リクエスト上限に達した場合は何もしない
    // TODO: 動作確認が一通り終わったら↓↓は削除する
    console.error(e);
  }
};

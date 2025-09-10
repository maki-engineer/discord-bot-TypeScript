import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from 'discord.js';
import Matsurihime from '../../matsurihime_api/Matsurihime';

/**
 * イベントのボーダースコアをお知らせする
 *
 * @param {ChatInputCommandInteraction} interaction ChatInputCommandInteractionクラス
 */
export default async (interaction: ChatInputCommandInteraction) => {
  if (interaction.commandName !== '235eventborder') return;

  const setTimeoutSec = 180_000;
  const notEventMessage = '現在、ボーダーをお知らせできるイベントは開催されていません！';

  try {
    const existsBorderEventList = [3, 4, 5, 10, 11, 12, 13, 16];
    const latestEventSummary = await Matsurihime.getLatestEventSummary(existsBorderEventList);

    const formatBeginAt = String(latestEventSummary.schedule.beginAt).replace('+09:00', '');
    const eventBeginAt = new Date(formatBeginAt);
    const formatEndAt = String(latestEventSummary.schedule.endAt).replace('+09:00', '');
    const eventEndAt = new Date(formatEndAt);
    const utcDateNow = new Date();
    const jstDateNow = new Date(utcDateNow.getTime() + 9 * 60 * 60 * 1000);

    // 最新のイベントの期間外だった場合
    if (
      jstDateNow.getTime() <= eventBeginAt.getTime() ||
      jstDateNow.getTime() >= eventEndAt.getTime()
    ) {
      await interaction.reply({ content: notEventMessage, ephemeral: true });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, setTimeoutSec);

      return;
    }

    const eventBorderScoreData = await Matsurihime.getLatestEventBorderScore(latestEventSummary.id);

    if (!eventBorderScoreData.eventPoint) {
      await interaction.reply({ content: notEventMessage, ephemeral: true });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, setTimeoutSec);

      return;
    }

    const targetBorderScore = eventBorderScoreData.eventPoint.scores.find(
      (score) => score.rank === 2500,
    )!;

    const eventPointBorderFieldList: { name: string; value: string; inline?: boolean }[] =
      eventBorderScoreData.eventPoint.scores
        .filter((border) => String(border.rank).length <= 2)
        .map((border) => {
          return { name: `**${border.rank}位**`, value: `${border.score}pt`, inline: true };
        });

    eventBorderScoreData.eventPoint.scores.forEach((border) => {
      if (String(border.rank).length > 2) {
        eventPointBorderFieldList.push({ name: '\u200B', value: '\u200B' });
        eventPointBorderFieldList.push({
          name: `**${border.rank}位**`,
          value: `${border.score}pt`,
        });
      }
    });

    const embedColorMap: { [key: number]: ColorResolvable } = {
      1: '#FF69B4',
      2: '#0000FF',
      3: '#FFFF00',
    };

    const embedColor = embedColorMap[latestEventSummary.appealType] ?? '#00FF99';

    const paddingMonth = String(jstDateNow.getMonth() + 1).padStart(2, '0');
    const paddingDate = String(jstDateNow.getDate()).padStart(2, '0');
    const paddingHour = String(jstDateNow.getHours()).padStart(2, '0');
    const paddingMin = String(jstDateNow.getMinutes() < 30 ? 0 : 30).padStart(2, '0');

    const embed = new EmbedBuilder()
      .setTitle('現在のボーダーをお知らせします！')
      .setAuthor({
        name: '235bot',
        iconURL: 'https://drive.google.com/uc?export=view&id=1zo-zZWNo47kh9HRzSZSKQynn5C8tv7Oh',
      })
      .addFields({ name: '\u200B', value: '\u200B' })
      .addFields({ name: 'イベント名', value: `**${latestEventSummary.name}**` })
      .addFields({ name: '\u200B', value: '\u200B' })
      .addFields(eventPointBorderFieldList)
      .addFields({ name: '\u200B', value: '\u200B' })
      .setColor(embedColor)
      .setFooter({
        text: `${paddingMonth}/${paddingDate} ${paddingHour}:${paddingMin} 更新`,
        iconURL: 'https://drive.google.com/uc?export=view&id=1IUcUJNF0js2tC0P4wh9ZK1vLJR5c0_MI',
      });

    // まだボーダースコアがセットされてなかったら初回はお知らせする
    if (!Matsurihime.borderScoreFor2500) {
      await interaction.reply({ embeds: [embed], ephemeral: true });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, setTimeoutSec);

      Matsurihime.borderScoreFor2500 = targetBorderScore.score;

      return;
    }

    // まだボーダーが更新されていなかった場合
    if (Matsurihime.borderScoreFor2500 === targetBorderScore.score) return;

    await interaction.reply({ embeds: [embed], ephemeral: true });

    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, setTimeoutSec);

    Matsurihime.borderScoreFor2500 = targetBorderScore.score;
  } catch (e) {
    // リクエスト上限に達した場合は何もしない
  }
};

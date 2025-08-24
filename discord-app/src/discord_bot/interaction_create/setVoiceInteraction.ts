import { EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';

/**
 * テキストを読み上げるキャラクターのボイスを変更
 *
 * @param {ChatInputCommandInteraction} interaction ChatInputCommandInteractionクラス
 */
export default async (interaction: ChatInputCommandInteraction) => {
  if (interaction.commandName !== '235setvoice') return;
  if (!interaction.member || !('id' in interaction.member)) return;

  const speakerId = interaction.options.getString('character') as string;

  const setTimeoutSec = 180_000;

  await BirthdayFor235MemberRepository.setSpeakerId(interaction.member.id, Number(speakerId));

  const embed = new EmbedBuilder()
    .setTitle('読み上げるキャラクターの声を変更しました！')
    .setColor('#00FF99')
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });

  setTimeout(() => {
    interaction.deleteReply().catch(() => {});
  }, setTimeoutSec);
};

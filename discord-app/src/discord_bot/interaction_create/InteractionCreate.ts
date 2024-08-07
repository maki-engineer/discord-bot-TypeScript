const { Interaction, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const DiscordBot = require('../DiscordBot').default;

/**
 * スラッシュコマンドが使われた時に行う処理クラス
 */
export default class InteractionCreate {
  private discordBot: typeof DiscordBot;

  private readonly setTimeoutSec = 180_000;

  constructor(discordBot: typeof DiscordBot) {
    this.discordBot = discordBot;
  }

  /**
   * interactionCreate メイン処理
   *
   * @return {void}
   */
  public interactionCreateEvent(): void {
    this.discordBot.on('interactionCreate', async (interaction: typeof Interaction) => {
      if (!interaction.isCommand()) return;

      this.createBirthdayEventMessageTemplateInteraction(interaction);
      this.createMaleEventMessageTemplateInteraction(interaction);
      this.divideVoiceChannelInteraction(interaction);
      await this.joinVoiceChannelInteraction(interaction);
    });
  }

  /**
   * 235birthdayコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private createBirthdayEventMessageTemplateInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235birthday') return;

    switch (interaction.user.id) {
      case this.discordBot.userIdForUtatane:
        interaction.reply('235birthdayコマンドを使用することで、毎月開催されるオンライン飲み会の企画文章を作成することが出来ます。コマンドを使用するときは、開催したい月、日程、時間の**3つ**を**半角数字のみ**、**半角スペースで区切って**入力してください。\n\n235birthday 12 14 21');

        setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
        break;

      default:
        interaction.reply('235birthday コマンドは、ラウンジマスターである**うたたねさん**だけが使用出来るコマンドです。');
        setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
        break;
    }
  }

  /**
   * 235menコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private createMaleEventMessageTemplateInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235men') return;

    switch (interaction.user.id) {
      case this.discordBot.userIdForUtatane:
        interaction.reply('235menコマンドを使用することで、毎月開催される235士官学校🌹の日程を決める文章を作成することが出来ます。コマンドを使用するときは、開催したい日程を**2～10個**、**半角数字のみ**で入力してください。\n\n235men 12 14 16 17');

        setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
        break;

      default:
        interaction.reply('235men コマンドは、ラウンジマスターである**うたたねさん**だけが使用出来るコマンドです。');
        setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
        break;
    }
  }

  /**
   * 235roomdivisionコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private divideVoiceChannelInteraction(interaction: typeof Interaction): void {
    if (interaction.commandName !== '235roomdivision') return;

    interaction.reply('235roomdivisionコマンドを使用することで、【雑談１】ボイスチャンネルに参加しているメンバーが10以上になったときに、部屋を分けることが出来ます。\nなお、【雑談１】ボイスチャンネルに参加しているメンバーが**10人未満**のときは分けることが出来ません。また、235roomdivisionコマンドは、【雑談１】ボイスチャンネルに参加しているメンバーのみが使用できます。');

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * 235joinコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private async joinVoiceChannelInteraction(interaction: typeof Interaction) {
    if (interaction.commandName !== '235join') return;

    const usedCommandMember = await interaction.guild.members.fetch(interaction.member.id);
    const memberJoinVoiceChannel = usedCommandMember.voice.channel;

    if (
      (this.discordBot.connection !== undefined)
      && (this.discordBot.connection.joinConfig.channelId === memberJoinVoiceChannel.id)
    ) {
      const embed = new EmbedBuilder()
        .setTitle('既に接続されています！')
        .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
        .setColor('#FF0000')
        .setTimestamp();

      interaction.reply({ embeds: [embed] });

      setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);

      return;
    }

    if (memberJoinVoiceChannel === null) {
      interaction.reply('235joinコマンドを使用することで、使用したメンバーが参加しているボイスチャンネルに235botが参加して、そのボイスチャンネルの聞き専チャンネルに投稿されたテキストを読み上げます！\nボイスチャンネルに参加してから再度このスラッシュコマンドを使用していただくか、もしくはテキストで「235join」と入力していただければボイスチャンネルに参加します！');

      return;
    }

    if (!memberJoinVoiceChannel.joinable || !memberJoinVoiceChannel.speakable) {
      interaction.reply('参加先のボイスチャンネルに接続できなかったか、もしくは参加先のボイスチャンネルで音声を再生する権限がありませんでした；；');

      return;
    }

    this.discordBot.connection = joinVoiceChannel({
      channelId: memberJoinVoiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfMute: false,
      selfDeaf: true,
    });

    const embed = new EmbedBuilder()
      .setTitle('接続されました！')
      .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
      .setColor('#00FF99')
      .setTimestamp();

    interaction.reply({ embeds: [embed] });

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }
}

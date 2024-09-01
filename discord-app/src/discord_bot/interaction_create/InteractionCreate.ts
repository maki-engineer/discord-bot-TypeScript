const { Interaction, EmbedBuilder, Client } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');
const DiscordBot = require('../DiscordBot').default;
const VoiceVox = require('../../voice_vox/VoiceVox').default;
const { BirthdayFor235Member, DictWord } = require('../../../models/index').default;

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
      await this.joinVoiceChannelInteraction(interaction, this.discordBot);
      await this.disconnectVoiceChannelInteraction(interaction);
      await this.setVoiceInteraction(interaction);
      await this.registWordInDictInteraction(interaction);
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
        interaction.reply({
          content: '235birthdayコマンドを使用することで、毎月開催されるオンライン飲み会の企画文章を作成することが出来ます。コマンドを使用するときは、開催したい月、日程、時間の**3つ**を**半角数字のみ**、**半角スペースで区切って**入力してください。\n\n235birthday 12 14 21',
          ephemeral: true,
        });

        setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
        break;

      default:
        interaction.reply({
          content: '235birthday コマンドは、ラウンジマスターである**うたたねさん**だけが使用出来るコマンドです。',
          ephemeral: true,
        });

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
        interaction.reply({
          content: '235menコマンドを使用することで、毎月開催される235士官学校🌹の日程を決める文章を作成することが出来ます。コマンドを使用するときは、開催したい日程を**2～10個**、**半角数字のみ**で入力してください。\n\n235men 12 14 16 17',
          ephemeral: true,
        });

        setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
        break;

      default:
        interaction.reply({
          content: '235men コマンドは、ラウンジマスターである**うたたねさん**だけが使用出来るコマンドです。',
          ephemeral: true,
        });

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

    interaction.reply({
      content: '235roomdivisionコマンドを使用することで、【雑談１】ボイスチャンネルに参加しているメンバーが10以上になったときに、部屋を分けることが出来ます。\nなお、【雑談１】ボイスチャンネルに参加しているメンバーが**10人未満**のときは分けることが出来ません。また、235roomdivisionコマンドは、【雑談１】ボイスチャンネルに参加しているメンバーのみが使用できます。',
      ephemeral: true,
    });

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * 235joinコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   * @param {Client} client Clientクラス
   *
   * @return {void}
   */
  private async joinVoiceChannelInteraction(
    interaction: typeof Interaction,
    client: typeof Client,
  ) {
    if (interaction.commandName !== '235join') return;

    const usedCommandMember = await interaction.guild.members.fetch(interaction.member.id);
    const memberJoinVoiceChannel = usedCommandMember.voice.channel;

    if (
      (client.connection !== undefined)
      && (client.connection.joinConfig.channelId === memberJoinVoiceChannel.id)
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

    const connectVoice = client.connectVoiceList[
      Math.floor(Math.random() * client.connectVoiceList.length)
    ];

    const filePath = './data/voice';
    const wavFile = `${filePath}/${usedCommandMember.user.id}.wav`;

    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

    await VoiceVox.generateAudioFile(connectVoice, wavFile, client.speakerId);
    VoiceVox.play(wavFile, client.connection);

    const embed = new EmbedBuilder()
      .setTitle('接続されました！')
      .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
      .setColor('#00FF99')
      .setTimestamp();

    interaction.reply({ embeds: [embed] });

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * 235disconnectコマンド
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private async disconnectVoiceChannelInteraction(interaction: typeof Interaction) {
    if (interaction.commandName !== '235disconnect') return;

    const usedCommandMember = await interaction.guild.members.fetch(interaction.member.id);
    const memberJoinVoiceChannel = usedCommandMember.voice.channel;

    if (this.discordBot.connection === undefined) {
      const embed = new EmbedBuilder()
        .setTitle('まだボイスチャンネルに接続されていません！')
        .setColor('#FF0000')
        .setTimestamp();

      interaction.reply({ embeds: [embed] });

      setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);

      return;
    }

    if (
      (memberJoinVoiceChannel === null)
      || (this.discordBot.connection.joinConfig.channelId !== memberJoinVoiceChannel.id)
    ) {
      const embed = new EmbedBuilder()
        .setTitle('切断できるのは235botが入っているボイスチャンネルに参加しているメンバーだけです！')
        .setColor('#FFCC00')
        .setTimestamp();

      interaction.reply({ embeds: [embed] });

      setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);

      return;
    }

    this.discordBot.connection.destroy();
    this.discordBot.connection = undefined;

    const embed = new EmbedBuilder()
      .setTitle('切断されました！')
      .setFields({ name: 'ボイスチャンネル名', value: memberJoinVoiceChannel.name })
      .setColor('#00FF99')
      .setTimestamp();

    interaction.reply({ embeds: [embed] });

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * テキストを読み上げるキャラクターのボイスを変更
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private async setVoiceInteraction(interaction: typeof Interaction) {
    if (interaction.commandName !== '235setvoice') return;

    await BirthdayFor235Member.setSpeakerId(interaction.member.id, interaction.options.getString('character'));

    const embed = new EmbedBuilder()
      .setTitle('読み上げるキャラクターの声を変更しました！')
      .setColor('#00FF99')
      .setTimestamp();

    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });

    this.discordBot.users.cache.get(this.discordBot.userIdForMaki).send(`235プロメンバーがテキスト読み上げボイスを変更しました！お手隙の際にデータの反映をお願いします！\n\nuser_id： ${interaction.member.id}\nspeaker_id： ${interaction.options.getString('character')}`);

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * 入力された単語と読み方を単語辞書に登録
   *
   * @param {Interaction} interaction Interactionクラス
   *
   * @return {void}
   */
  private async registWordInDictInteraction(interaction: typeof Interaction) {
    if (interaction.commandName !== '235addword') return;

    if (/^[ァ-ヶー]*$/.test(interaction.options.getString('読み方')) === false) {
      const embed = new EmbedBuilder()
        .setTitle('辞書登録に失敗しました；；')
        .setDescription('読み方は全角カタカタのみで入力するようにする必要があります。')
        .setColor('#FF0000')
        .setTimestamp();

      interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });

      setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);

      return;
    }

    await this.registWord(
      interaction.options.getString('単語'),
      interaction.options.getString('読み方'),
    );

    const embed = new EmbedBuilder()
      .setTitle('辞書に登録しました！')
      .addFields(
        { name: '単語', value: interaction.options.getString('単語'), inline: true },
        { name: '読み方', value: interaction.options.getString('読み方'), inline: true },
      )
      .setColor('#00FF99')
      .setTimestamp();

    interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });

    setTimeout(() => interaction.deleteReply(), this.setTimeoutSec);
  }

  /**
   * 単語を辞書に登録
   * すでに登録されていた単語が指定されていた場合は更新するように
   *
   * @param {string} word 単語
   * @param {string} howToRead 読み方
   *
   * @return {void}
   */
  private async registWord(word: string, howToRead: string) {
    const dictWordList: [] | {
      word: string,
      how_to_read: string,
    }[] = await DictWord.getDictWordList();

    const wordList = dictWordList.map((dictWordData: {
      word: string,
      how_to_read: string,
    }) => dictWordData.word);

    // すでに登録されていたら更新
    if (wordList.includes(word)) {
      await DictWord.updateReadOfWordToDict(word, howToRead);
      this.discordBot.users.cache.get(this.discordBot.userIdForMaki).send(`単語辞書に登録されている単語の読み方が更新されました！\nお手隙の際に反映をお願いします！\n\n更新対象の単語： ${word}\n更新後の読み方： ${howToRead}`);

      return;
    }

    await DictWord.saveNewWordToDict(word, howToRead);
    this.discordBot.users.cache.get(this.discordBot.userIdForMaki).send(`単語辞書に新しい単語が追加されました！\nお手隙の際に反映をお願いします！\n\n追加された単語： ${word}\n読み方： ${howToRead}`);
  }
}

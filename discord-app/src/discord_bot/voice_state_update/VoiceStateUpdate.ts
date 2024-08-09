const { Client, GuildMember, VoiceState } = require('discord.js');
const { default: axios } = require('axios');

const {
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  StreamType,
} = require('@discordjs/voice');

const fs = require('fs');
const DiscordBot = require('../DiscordBot').default;

/**
 * ボイスチャンネルに誰かが参加/退出した時に行う処理クラス
 */
export default class VoiceStateUpdate {
  private discordBot: typeof DiscordBot;

  constructor(discordBot: typeof DiscordBot) {
    this.discordBot = discordBot;
  }

  /**
   * voiceStateUpdate メイン処理
   *
   * @return {void}
   */
  public voiceStateUpdateEvent(): void {
    this.discordBot.on('voiceStateUpdate', async (stateMember: typeof VoiceState) => {
      this.disconnectVoiceChannelFor235Bot(this.discordBot, stateMember);
      await VoiceStateUpdate.announceJoinedVoiceChannelFrom235Member(this.discordBot, stateMember);
    });
  }

  /**
   * 235botが入っているボイスチャンネルの人数がbotを除いて0人になったらボイスチャンネルから切断
   *
   * @param {Client} client Clientクラス
   * @param {VoiceState} stateMember VoiceStateクラス
   *
   * @return {void}
   */
  private disconnectVoiceChannelFor235Bot(
    client: typeof Client,
    stateMember: typeof VoiceState,
  ): void {
    if (stateMember.channelId === null) return;

    const participatingVoiceChannelMemberList = client.voice.client.channels.cache
      .get(stateMember.channelId).members
      .filter((member: typeof GuildMember) => member.user.bot === false)
      .map((member: typeof GuildMember) => member.user.id);

    if (
      (participatingVoiceChannelMemberList.length > 0)
      || (this.discordBot.connection === undefined)
    ) {
      return;
    }

    this.discordBot.connection.destroy();
    this.discordBot.connection = undefined;
  }

  /**
   * 235botが入っているボイスチャンネルに235プロダクションメンバーが参加した場合に、
   * 誰が参加したのかを235botがお知らせ
   *
   * @param {Client} client Clientクラス
   * @param {VoiceState} stateMember VoiceStateクラス
   *
   * @return {void}
   */
  private static async announceJoinedVoiceChannelFrom235Member(
    client: typeof Client,
    stateMember: typeof VoiceState,
  ) {
    // 退出タイミング or 235botがボイスチャンネルに参加していない場合
    if (
      (stateMember.channelId !== null)
      || (client.connection === undefined)
    ) return;

    const joinedVoiceChannelMember = await stateMember.guild.members.fetch(stateMember.id);
    const joinedVoiceChannelId = joinedVoiceChannelMember.voice.channel.id;

    // 235botがいるボイスチャンネルじゃなかった or botが参加してきた場合
    if (
      (joinedVoiceChannelMember.user.bot === true)
      || (joinedVoiceChannelId !== client.connection.joinConfig.channelId)
    ) return;

    const announceVoiceList = [
      `${joinedVoiceChannelMember.user.globalName}さんが来ました！`,
      `${joinedVoiceChannelMember.user.globalName}さんが現れた！！`,
      `やっほ～！！${joinedVoiceChannelMember.user.globalName}さんに挨拶しましょう！`,
      `${joinedVoiceChannelMember.user.globalName}さん、どうもです！！`,
    ];

    const announceVoice = announceVoiceList[Math.floor(Math.random() * announceVoiceList.length)];

    const filePath = './data/voice';
    const wavFile = `${filePath}/${stateMember.id}.wav`;

    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });

    const readText = VoiceStateUpdate.formatMessage(announceVoice);
    await VoiceStateUpdate.generateAudioFile(readText, wavFile, client.speakerId);
    VoiceStateUpdate.play(wavFile, client.connection);
  }

  /**
   * 読み上げるテキストの内容をフォーマット（絵文字やURLなどを排除）
   *
   * @param {string} messageContent フォーマット対象のメッセージ
   *
   * @return {string}
   */
  private static formatMessage(messageContent: string): string {
    let formattedMessageContent: string = messageContent;

    formattedMessageContent = formattedMessageContent.replace(/<:[a-zA-Z0-9_]+:[0-9]+>/g, '');
    formattedMessageContent = formattedMessageContent.replace(/\r?\n/g, '、');

    return formattedMessageContent;
  }

  /**
   * 入力されたテキストを読み上げるwavファイルを生成
   *
   * @param {string} readText 読み上げ対象のメッセージ
   * @param {string} wavFile wavファイルの保存先パス
   * @param {string} speakerId
   *
   * @return {void}
   */
  private static async generateAudioFile(readText: string, wavFile: string, speakerId: string) {
    const voiceVox = axios.create({ baseURL: 'http://voicevox-engine:50021/', proxy: false });

    const audioQuery = await voiceVox.post(`audio_query?text=${encodeURI(readText)}&speaker=${speakerId}`, {
      headers: { accept: 'application/json' },
    });

    const synthesis = await voiceVox.post(`synthesis?speaker=${speakerId}`, JSON.stringify(audioQuery.data), {
      responseType: 'arraybuffer',
      headers: {
        accept: 'audio/wav',
        'Content-Type': 'application/json',
      },
    });

    fs.writeFileSync(wavFile, Buffer.from(synthesis.data), 'binary');
  }

  /**
   * 生成したwavファイルを元に読み上げ
   *
   * @param {string} wavFile 生成したwavファイル
   * @param {any} connection ボイスチャンネルオブジェクト
   *
   * @return {void}
   */
  private static play(wavFile: string, connection: any): void {
    const resource = createAudioResource(wavFile, { inputType: StreamType.Arbitrary });
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    player.play(resource);

    connection.subscribe(player);
  }
}

const { Client, GuildMember, VoiceState } = require('discord.js');
const fs = require('fs');
const DiscordBot = require('../DiscordBot').default;
const VoiceVox = require('../../voice_vox/VoiceVox').default;

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

    if (this.discordBot.connection === undefined) return;

    // 0人になったチャンネルが235botが参加している場所かどうか
    if (
      (stateMember.channelId !== client.connection.joinConfig.channelId)
      || (participatingVoiceChannelMemberList.length > 0)
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

    const readText = VoiceVox.formatMessage(announceVoice);
    await VoiceVox.generateAudioFile(readText, wavFile, client.speakerId);
    VoiceVox.play(wavFile, client.connection);
  }
}

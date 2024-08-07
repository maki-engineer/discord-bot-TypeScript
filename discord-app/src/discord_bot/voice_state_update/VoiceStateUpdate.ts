const { Client, GuildMember, VoiceState } = require('discord.js');
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
    this.discordBot.on('voiceStateUpdate', (stateMember: typeof VoiceState) => {
      this.disconnectVoiceChannelFor235Bot(this.discordBot, stateMember);
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
}

import { VoiceState } from 'discord.js';
import announceJoinedVoiceChannelFrom235Member from './announceJoinedVoiceChannelFrom235Member';
import disconnectVoiceChannelFor235Bot from './disconnectVoiceChannelFor235Bot';
import VoiceVox from '../../voice_vox/VoiceVox';
import type { DiscordBotType } from '../DiscordBotType';

/**
 * ボイスチャンネルに誰かが参加/退出した時に行う処理クラス
 */
export default class VoiceStateUpdate {
  private discordBot: DiscordBotType;

  private voiceVox: VoiceVox;

  /**
   * @param {DiscordBotType} discordBot DiscordBotクラス
   * @param {VoiceVox} voiceVox VoiceVoxクラス
   */
  constructor(discordBot: DiscordBotType, voiceVox: VoiceVox) {
    this.discordBot = discordBot;
    this.voiceVox = voiceVox;
  }

  /**
   * voiceStateUpdate メイン処理
   */
  public voiceStateUpdateEvent() {
    this.discordBot.on('voiceStateUpdate', async (stateMember: VoiceState) => {
      disconnectVoiceChannelFor235Bot(this.discordBot, stateMember);
      await announceJoinedVoiceChannelFrom235Member(this.discordBot, this.voiceVox, stateMember);
    });
  }
}

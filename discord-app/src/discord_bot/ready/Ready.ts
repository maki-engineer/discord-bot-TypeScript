import cron from 'node-cron';
import deleteOldMessageFrom235ChatPlaceChannel from './deleteOldMessageFrom235ChatPlaceChannel';
import celebrate235Member from './celebrate235Member';
import celebrate235ProductionAnniversary from './celebrate235ProductionAnniversary';
import celebrateMillionMember from './celebrateMillionMember';
import celebrateMillionLiveAnniversary from './celebrateMillionLiveAnniversary';
import disconnectVoiceChannel from './disconnectVoiceChannel';
import setCommand from './setCommand';
import setStatus from './setStatus';
import send235MemberBirthdayListToUtatane from './send235MemberBirthdayListToUtatane';
import { DiscordBotType } from '../DiscordBotType';
import VoiceVox from '../../voice_vox/VoiceVox';

/**
 * 常時行う処理クラス
 */
export default class Ready {
  private discordBot: DiscordBotType;

  private voiceVox: VoiceVox;

  private readonly channelIdForEventBorderNotice = process.env.CHANNEL_ID_FOR_EVENT_BORDER_NOTICE!;

  /**
   * @param {DiscordBotType} discordBot DiscordBotクラス
   * @param {VoiceVox} voiceVox VoiceVoxクラス
   */
  constructor(discordBot: DiscordBotType, voiceVox: VoiceVox) {
    this.discordBot = discordBot;
    this.voiceVox = voiceVox;
  }

  /**
   * ready メイン処理
   */
  public readyEvent() {
    this.discordBot.on('clientReady', async () => {
      await setCommand(this.discordBot);
      setStatus(this.discordBot);

      if (
        this.discordBot.channels.cache.get(this.discordBot.channelIdFor235ChatPlace) === undefined
      ) {
        return;
      }

      cron.schedule('0 15 3 * * *', () => deleteOldMessageFrom235ChatPlaceChannel(this.discordBot));
      cron.schedule('0 0 3 * * *', () => {
        celebrate235Member(this.discordBot).catch(() => {});
      });
      cron.schedule('0 30 3 * * *', () => celebrateMillionMember(this.discordBot));
      cron.schedule('0 0 4 * * *', () => celebrate235ProductionAnniversary(this.discordBot));
      cron.schedule('0 0 4 * * *', () => celebrateMillionLiveAnniversary(this.discordBot));
      cron.schedule('0 15 4 1 * *', () => {
        send235MemberBirthdayListToUtatane(this.discordBot).catch(() => {});
      });
      cron.schedule('0 50 22,4,10,16 * * *', () => {
        disconnectVoiceChannel(this.discordBot, this.voiceVox).catch(() => {});
      });
      cron.schedule('0 55 22,4,10,16 * * *', () => process.exit());
    });
  }
}

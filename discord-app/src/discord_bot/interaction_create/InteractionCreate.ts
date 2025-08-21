import { ChatInputCommandInteraction, Interaction } from 'discord.js';
import createBirthdayEventMessageTemplateInteraction from './createBirthdayEventMessageTemplateInteraction';
import createMaleEventMessageTemplateInteraction from './createMaleEventMessageTemplateInteraction';
import divideVoiceChannelInteraction from './divideVoiceChannelInteraction';
import disconnectVoiceChannelInteraction from './disconnectVoiceChannelInteraction';
import joinVoiceChannelInteraction from './joinVoiceChannelInteraction';
import setVoiceInteraction from './setVoiceInteraction';
import registWordInDictInteraction from './registWordInDictInteraction';
import { DiscordBotType } from '../DiscordBotType';
import VoiceVox from '../../voice_vox/VoiceVox';

/**
 * スラッシュコマンドが使われた時に行う処理クラス
 */
export default class InteractionCreate {
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
   * interactionCreate メイン処理
   */
  public interactionCreateEvent() {
    this.discordBot.on('interactionCreate', async (interaction: Interaction) => {
      if (!interaction.isCommand()) return;

      await createBirthdayEventMessageTemplateInteraction(this.discordBot, interaction);
      await createMaleEventMessageTemplateInteraction(this.discordBot, interaction);
      await divideVoiceChannelInteraction(interaction);
      await joinVoiceChannelInteraction(
        this.discordBot,
        this.voiceVox,
        interaction as ChatInputCommandInteraction,
      );
      await disconnectVoiceChannelInteraction(
        this.discordBot,
        interaction as ChatInputCommandInteraction,
      );
      await setVoiceInteraction(interaction as ChatInputCommandInteraction);
      await registWordInDictInteraction(interaction as ChatInputCommandInteraction);
    });
  }
}

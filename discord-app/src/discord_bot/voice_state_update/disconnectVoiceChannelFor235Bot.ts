import { GuildMember, VoiceState, VoiceChannel } from 'discord.js';
import type { DiscordBotType } from '../DiscordBotType';

/**
 * 235botが入っているボイスチャンネルの人数がbotを除いて0人になったらボイスチャンネルから切断
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {VoiceState} stateMember VoiceStateクラス
 */
export default (client: DiscordBotType, stateMember: VoiceState) => {
  if (stateMember.channelId === null) return;

  const channel = client.voice.client.channels.cache.get(stateMember.channelId) as VoiceChannel;

  const participatingVoiceChannelMemberList: string[] = channel.members
    .filter((member: GuildMember) => {
      return !member.user.bot;
    })
    .map((member: GuildMember) => member.user.id);

  if (client.connection === undefined) return;

  // 0人になったチャンネルが235botが参加している場所かどうか
  if (
    stateMember.channelId !== client.connection.joinConfig.channelId ||
    participatingVoiceChannelMemberList.length > 0
  ) {
    return;
  }

  client.connection.destroy();
  client.connection = undefined;
};

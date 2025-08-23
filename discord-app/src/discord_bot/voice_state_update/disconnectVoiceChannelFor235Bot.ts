import { VoiceState, VoiceChannel } from 'discord.js';
import type { DiscordBotType } from '../DiscordBotType';

/**
 * 235botが入っているボイスチャンネルの人数がbotを除いて0人になったらボイスチャンネルから切断
 *
 * @param {DiscordBotType} client DiscordBotクラス
 * @param {VoiceState} oldStateMember VoiceStateクラス
 * @param {VoiceState} newStateMember VoiceStateクラス
 */
export default (client: DiscordBotType, oldStateMember: VoiceState, newStateMember: VoiceState) => {
  // 参加タイミングだった場合
  if (oldStateMember.channelId === null || newStateMember.channelId !== null) return;
  // 235botがボイスチャンネルに参加していない場合
  if (client.connection === undefined) return;
  // 235botがいるボイスチャンネルじゃなかった場合
  if (oldStateMember.channelId !== client.connection.joinConfig.channelId) return;

  const channel = oldStateMember.channel as VoiceChannel;

  const participatingVoiceChannelMemberList = channel.members
    .filter((member) => !member.user.bot)
    .map((member) => member.user.id);

  // 235bot以外に誰かいる場合
  if (participatingVoiceChannelMemberList.length > 0) return;

  client.connection.destroy();
  client.connection = undefined;
};

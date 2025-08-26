import type { Client as ClientType } from 'discord.js';
import type {
  AudioPlayer as AudioPlayerType,
  VoiceConnection as VoiceConnectionType,
} from '@discordjs/voice';

export interface DiscordBotType extends ClientType {
  celebrateMillionMemberReactionEmoji: string;
  isReactionCelebrate235MemberMessage: boolean;
  dividedUserIdList: string[];
  connection: VoiceConnectionType | undefined;
  speakerId: string;
  wavFileQueue: string[];
  isPlaying: boolean;

  readonly discordToken: string;
  readonly audioPlayer: AudioPlayerType;
  readonly connectVoiceList: string[];
  readonly commandList: {
    name: string;
    description: string;
    options?: {
      type: number;
      name: string;
      description: string;
      required: boolean;
      choices?: {
        name: string;
        value: string;
      }[];
    }[];
  }[];
  readonly serverIdFor235: string;
  readonly channelIdFor235ChatPlace: string;
  readonly channelIdFor235Introduction: string;
  readonly channelIdFor235ListenOnly: string;
  readonly channelIdFor235ListenOnly2: string;
  readonly channelIdForGameListenOnly: string;
  readonly voiceChannelIdFor235ChatPlace: string;
  readonly voiceChannelIdFor235ChatPlace2: string;
  readonly voiceChannelIdForGame: string;
  readonly userIdForUtatane: string;
  readonly userIdForMaki: string;

  start(): Promise<void>;
}

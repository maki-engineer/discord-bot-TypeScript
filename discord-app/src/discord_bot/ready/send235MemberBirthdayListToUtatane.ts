import fs from 'fs';
import { DiscordBotType } from '../DiscordBotType';
import BirthdayFor235MemberRepository from '../../../repositories/BirthdayFor235MemberRepository';

/**
 * 毎月1日にうたたねさんに235プロダクションメンバーの誕生日リストをDMで送る
 *
 * @param {DiscordBotType} client DiscordBotクラス
 */
export default async (client: DiscordBotType) => {
  let text = '名前,誕生日\n';
  const csvPath = './data/csv';
  const csvFile = `${csvPath}/birthday_for_235_members.csv`;

  if (!fs.existsSync(csvPath)) fs.mkdirSync(csvPath, { recursive: true });

  fs.writeFileSync(csvFile, text);

  const memberList = await BirthdayFor235MemberRepository.get235MemberBirthdayListForCSV();

  memberList.forEach((member) => {
    text += `${member.name}さん,${member.month}月${member.date}日\n`;
  });

  fs.writeFileSync(csvFile, text);

  const utataneUser = await client.users.fetch(client.userIdForUtatane);
  await utataneUser.send({
    content:
      'お疲れ様です！新しい月が始まりましたね！✨\n235プロダクションメンバーの誕生日リストをお送りします！\nもしまだ追加されていないメンバー、もしくはすでに退出されているメンバーがいた場合は報告をお願いします！🙇‍♂️',
    files: [
      {
        attachment: csvFile,
        name: 'birthday_for_235_members.csv',
      },
    ],
  });

  const makiUser = await client.users.fetch(client.userIdForMaki);
  await makiUser.send({
    content: '235プロダクションメンバーの誕生日リストをうたたねさんに送りました！',
    files: [
      {
        attachment: csvFile,
        name: 'birthday_for_235_members.csv',
      },
    ],
  });
};

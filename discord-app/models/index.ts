import { Dialect, Sequelize } from 'sequelize';
import DictWord from './dictword';
import BirthdayFor235Member from './birthdayfor235member';
import BirthdayForMillionMember from './birthdayformillionmember';
import DeleteMessage from './deletemessage';
import config from '../config/config';

const env = process.env.NODE_ENV || 'development';

let sequelize!: Sequelize;

if (env === 'development') {
  const developmentConfig = config[env];

  sequelize = new Sequelize(developmentConfig.url, {
    dialectOptions: {
      ssl: { require: true },
    },
  });
} else if (env === 'unittest') {
  const unittestConfig = config[env];

  sequelize = new Sequelize(
    unittestConfig.database,
    unittestConfig.username,
    unittestConfig.password,
    {
      ...unittestConfig,
      dialect: unittestConfig.dialect as Dialect,
    },
  );
}

const db: {
  BirthdayFor235Member: typeof BirthdayFor235Member;
  BirthdayForMillionMember: typeof BirthdayForMillionMember;
  DictWord: typeof DictWord;
  DeleteMessage: typeof DeleteMessage;
  sequelize?: typeof sequelize;
  Sequelize?: typeof Sequelize;
} = {
  BirthdayFor235Member: BirthdayFor235Member.initialize(sequelize),
  BirthdayForMillionMember: BirthdayForMillionMember.initialize(sequelize),
  DictWord: DictWord.initialize(sequelize),
  DeleteMessage: DeleteMessage.initialize(sequelize),
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;

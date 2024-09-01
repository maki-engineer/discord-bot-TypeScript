const { Sequelize } = require('sequelize');
const BirthdayFor235Member = require('./birthdayfor235member').default;
const BirthdayForMillionMember = require('./birthdayformillionmember').default;
const DictWord = require('./dictword').default;
const DeleteMessage = require('./deletemessage').default;

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db: {
  BirthdayFor235Member: typeof BirthdayFor235Member,
  BirthdayForMillionMember: typeof BirthdayForMillionMember,
  DictWord: typeof DictWord,
  DeleteMessage: typeof DeleteMessage,
  sequelize?: typeof sequelize,
  Sequelize?: typeof Sequelize,
} = {
  BirthdayFor235Member: BirthdayFor235Member.initialize(sequelize),
  BirthdayForMillionMember: BirthdayForMillionMember.initialize(sequelize),
  DictWord: DictWord.initialize(sequelize),
  DeleteMessage: DeleteMessage.initialize(sequelize),
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;

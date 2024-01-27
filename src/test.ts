const DB = require('../models/index');
const fs = require('fs');


let text: string = '名前,誕生日\n';
const csvPath: string = 'data/csv/birthday_for_235_members.csv';

fs.writeFileSync(csvPath, text);

// csvファイル作成
DB.BirthdayFor235Member.findAll({
  attributes: [
    'name',
    'month',
    'date',
  ],
  order: [
    ['month'],
    ['date'],
  ]
}).then((instances: any): void => {
  instances.forEach((row: any): void => {
    text += row.dataValues.name + 'さん,' + row.dataValues.month + '月' + row.dataValues.date + '日\n';
    fs.writeFileSync(csvPath, text);
  });
});

require('dotenv').config();

export = {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: 'db',
    port: '5432',
    dialect: 'postgres',
    timezone: '+09:00',
  },
  unittest: {
    username: process.env.POSTGRES_USER_UNITTEST,
    password: process.env.POSTGRES_PASSWORD_UNITTEST,
    database: process.env.POSTGRES_DB_UNITTEST,
    host: '127.0.0.1',
    port: '5433',
    dialect: 'postgres',
    timezone: '+09:00',
  },
}

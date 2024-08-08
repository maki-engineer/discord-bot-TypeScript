require('dotenv').config();

export = {
  development: {
    database: 'db-development',
    dialect: 'sqlite',
    storage: './databases/db-dev.sqlite3',
  },
  unittest: {
    database: 'db-unittest',
    dialect: 'sqlite',
    storage: './databases/db-unittest.sqlite3',
  },
  production: {
    database: 'db-production',
    dialect: 'sqlite',
    storage: './databases/db-prod.sqlite3',
  },
}

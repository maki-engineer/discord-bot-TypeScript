const path = require('path');

module.exports = {
  '*.ts': (files) => {
    if (files.length === 0) {
      return [];
    }

    const formatFileList = files.map((file) => {
      return path.normalize(path.relative(process.cwd(), file)).replace(/\\/g, '/');
    });

    const taskList = [];

    // Prettier を実行
    taskList.push(`npx prettier --write ${formatFileList.join(' ')}`);

    // linter を実行
    taskList.push(`npx eslint ${formatFileList.join(' ')}`);

    // コンパイルを実行
    taskList.push('npm run compile');

    return taskList;
  },
  'tests/**/*.ts': (files) => {
    if (files.length === 0) {
      return [];
    }

    const formatFileList = files.map((file) => {
      return path.normalize(path.relative(process.cwd(), file)).replace(/\\/g, '/');
    });

    const taskList = [];

    taskList.push(`npm run test ${formatFileList.join(' ')}`);

    return taskList;
  },
  '{models,repositories}/**/*.ts': (files) => {
    if (files.length === 0) {
      return [];
    }

    const taskList = [];

    taskList.push('npm run test');

    return taskList;
  },
};

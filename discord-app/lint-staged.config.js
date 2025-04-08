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

    const testFileList = formatFileList.filter((file) => file.startsWith('tests/'));

    if (testFileList.length > 0) {
      // test を実行
      taskList.push(`npm run test ${testFileList.join(' ')}`);
    }

    return taskList;
  },
};

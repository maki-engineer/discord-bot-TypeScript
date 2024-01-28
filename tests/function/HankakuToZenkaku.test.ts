const { zenkakuToHankaku } = require('../../src/function');

describe('hankakuToZenkaku', () => {
  test('test正常系_全角英数字が半角英数字に変換されること', () => {
    const result: string = zenkakuToHankaku('ａｂｃ１２３');

    expect(result).toBe('abc123');
  });

  test('test正常系_全角英数字と半角英数字が混ざっていた場合は、全角英数字の部分のみが変換されること', () => {
    const result: string = zenkakuToHankaku('ａbｃ１2３');

    expect(result).toBe('abc123');
  });

  test.each([
    ['test正常系_半角英数字のみが渡された場合、何も変換されないこと', 'abc123'],
    ['test正常系_空白の文字列が渡された場合、何も変換されないこと', ' '],
    ['test正常系_空の文字列が渡された場合、何も変換されないこと', ''],
  ])('%s', (conditions: string, receivedAndExpected: string) => {
    const result : string = zenkakuToHankaku(receivedAndExpected);

    expect(result).toBe(receivedAndExpected);
  });
});

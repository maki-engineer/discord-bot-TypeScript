/**
 * 全角英数字 → 半角英数字に変換
 *
 * @param {string} str
 *
 * @return {string}
 */
exports.zenkakuToHankaku = (str: string): string => {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
}

// 配列の重複チェック
exports.existsSameValue = (a: string[]): boolean => {
  const s = new Set(a);

  return s.size !== a.length;
}

/**
 * 配列を昇順に並び替える。
 *
 * @param {number} a
 * @param {number} b
 *
 * @return {number}
 */
exports.compareFunc = (a: number, b: number): number => a - b;

/**
 * レーベンシュタイン距離によって文字の類似値をチェック。
 *
 * @param {string} str1
 * @param {string} str2
 *
 * @return {number}
 */
exports.levenshteinDistance = (str1: string, str2: string): number => {
  const x: number = str1.length;
  const y: number = str2.length;

  const d: any = [];

  for (let i: number = 0; i <= x; i++ ) {
      d[i] = [];
      d[i][0] = i;
  }

  for (let i: number = 0; i <= y; i++ ) {
      d[0][i] = i;
  }

  let cost: number = 0;

  for (let i: number = 1; i <= x; i++ ) {
    for (let j: number = 1; j <= y; j++ ) {
      cost = str1[i - 1] === str2[j - 1] ? 0 : 1;

      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }

  return d[x][y];
}

/**
 * 配列を指定した数で分割。
 *
 * @param {any} array
 * @param {number} number
 *
 * @return {any}
 */
exports.sliceByNumber = (array: any, sliceNumber: number): any => {
  const length: number = Math.ceil(array.length / sliceNumber)
  const initial: undefined = undefined;

  return new Array(length).fill(initial).map((_, i) =>
    array.slice(i * sliceNumber, (i + 1) * sliceNumber)
  )
}

// ひらがなをカタカナに変換
exports.hiraToKana = (str: string): string => {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
      const chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
  });
}

// 配列シャッフル
exports.shuffle = ([...array]) => {
  for (let i: number = array.length - 1; i >= 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

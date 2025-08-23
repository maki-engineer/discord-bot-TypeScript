/**
 * 現在日時を取得
 *
 * @return {object}
 */
export default () => {
  const today = new Date();

  return {
    todayYear: today.getFullYear(),
    todayMonth: today.getMonth() + 1,
    todayDate: today.getDate(),
    todayHour: today.getHours(),
    todayMin: today.getMinutes(),
  };
};

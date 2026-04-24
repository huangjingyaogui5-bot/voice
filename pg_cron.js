// ランダムな時間を生成するロジック (TypeScript)
function getRandomTime(startHour: number, endHour: number): Date {
  const date = new Date();
  const start = new Date(date.setHours(startHour, 0, 0, 0));
  const end = new Date(date.setHours(endHour, 0, 0, 0));
  const randomTs = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTs);
}

// 毎朝0時に実行され、全ユーザーのその日のスケジュールを確定させる
// 実際の送信は Supabase の HTTPリクエスト(pg_net)を利用
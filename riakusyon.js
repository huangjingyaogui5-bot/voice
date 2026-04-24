async function playReaction(reactionId) {
  // 1. 再生前確認
  if (!confirm("この音声は1回しか聴けません。よろしいですか？")) return;

  // 2. 画面をブラー（ボカシ）にする
  document.getElementById('app-container').style.filter = "blur(20px)";

  // 3. 再生フラグを即座に更新（再生開始と同時が鉄則）
  const { data, error } = await supabase
    .from('reactions')
    .update({ is_played: true })
    .match({ id: reactionId, is_played: false });

  if (error || !data) {
    alert("既に再生済みか、期限切れです。");
    return;
  }

  // 4. 音声再生
  const audio = new Audio(audioUrl);
  audio.play();

  audio.onended = () => {
    document.getElementById('app-container').style.filter = "none";
    alert("音声は消滅しました。");
    location.reload(); // メモリからも消去
  };
}
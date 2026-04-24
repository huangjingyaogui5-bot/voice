let mediaRecorder;
let chunks = [];

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // 3秒から30秒の間でランダム決定
  const durationLimit = Math.floor(Math.random() * (30 - 3 + 1)) + 3;
  
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
  
  // UI更新：キャンセルボタンを非活性化、タイマー開始
  document.getElementById('cancel-btn').disabled = true;
  startTimer(durationLimit);

  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = uploadVoice;

  mediaRecorder.start();

  // 指定時間後に強制停止
  setTimeout(() => {
    mediaRecorder.stop();
  }, durationLimit * 1000);
}
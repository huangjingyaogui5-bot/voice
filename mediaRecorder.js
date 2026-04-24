import { supabase } from './Untitled-1.js';

let mediaRecorder;
let audioChunks = [];
let countdown;
let timeLeft = 10;

// 要素の取得
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const timerDisplay = document.getElementById('timer');
const postList = document.getElementById('post-list');

// カウントダウン開始関数
function startCountdown() {
    timeLeft = 10;
    timerDisplay.innerText = timeLeft;
    clearInterval(countdown);
    countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) clearInterval(countdown);
    }, 1000);
}

// 録音開始
export const starRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
        
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/mp4';

        mediaRecorder = new MediaRecorder(stream, { mimeType });
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            clearInterval(countdown);
            const audioBlob = new Blob(audioChunks, { type: mimeType });

            // --- ログインなしで保存する処理 ---
            timerDisplay.innerText = "アップロード中...";
            const fileName = `voice_${Date.now()}.${mimeType.includes('webm') ? 'webm' : 'mp4'}`;

            // 1. Storageへアップロード
            const { error: uploadError } = await supabase.storage
                .from('recordings')
                .upload(`public/${fileName}`, audioBlob);

            if (uploadError) {
                console.error("アップロード失敗:", uploadError);
                timerDisplay.innerText = "アップロード失敗...";
                return;
            }

            // 2. データベース(voice_posts)へ登録
            const { error: dbError } = await supabase
                .from('voice_posts')
                .insert([
                    {
                        audio_url: fileName,
                        user_id: null // ログイン不要なので空(null)にする
                    }
                ]);

            if (dbError) {
                console.error("SQL登録失敗:", dbError.message);
                timerDisplay.innerText = "DB保存失敗...";
            } else {
                timerDisplay.innerText = "完了！保存されました";
                loadVoices(); 
            }

            startBtn.disabled = false;
            stopBtn.disabled = true;
            startBtn.innerText = "録音開始";
        };

        mediaRecorder.start();
        startCountdown();
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        startBtn.innerText = "録音中...";

        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === "recording") stopRecording();
        }, 10000);

    } catch (err) {
        console.error("マイク許可エラー:", err);
        alert("マイクの使用が許可されていないか、エラーが発生しました。");
    }
};

// 録音停止
export const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
};

startBtn.onclick = starRecording;
stopBtn.onclick = stopRecording;

// リスト読み込み
async function loadVoices() {
    const { data: posts, error } = await supabase
        .from('voice_posts')
        .select('*')
        .order('created_at', { ascending: false});

    if (error) {
        console.error("読み込み失敗:", error);
        return;
    }

    postList.innerHTML = ''; 

    posts.forEach(post => {
        const { data } = supabase.storage.from('recordings').getPublicUrl(`public/${post.audio_url}`);
        const div = document.createElement('div');
        div.style.border = "1px solid #ccc";
        div.style.margin = "10px";
        div.style.padding = "10px";
        div.innerHTML = `
            <p>投稿日: ${new Date(post.created_at).toLocaleString()}</p>
            <audio src="${data.publicUrl}" controls></audio>
        `;
        postList.appendChild(div);
    });
}

// 最初にリストを表示
loadVoices();
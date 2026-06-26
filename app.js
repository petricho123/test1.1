import { QuizParser } from './parser.js';
import { QuizStorage } from './storage.js';
import { QuizEngine } from './quiz.js';
import { PDFGen } from './pdf.js';

let engine = null;

// UI 요소
const uploadSec = document.getElementById('upload-section');
const quizSec = document.getElementById('quiz-section');
const resultSec = document.getElementById('result-section');
const fileInput = document.getElementById('file-input');

// 테마 제어
document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', targetTheme);
});

// 파일 업로드 이벤트
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const data = QuizParser.parse(event.target.result);
        if (data) {
            QuizStorage.clear();
            QuizStorage.saveQuizData(data);
            initQuiz(data);
        }
    };
    reader.readAsText(file);
});

function initQuiz(data, savedAns = []) {
    engine = new QuizEngine(data, savedAns);
    uploadSec.classList.add('hidden');
    resultSec.classList.add('hidden');
    quizSec.classList.remove('hidden');
    document.getElementById('quiz-title').textContent = engine.title;
    renderQuestion();
}

function renderQuestion() {
    const q = engine.getCurrentQuestion();
    const total = engine.questions.length;
    const current = engine.currentIndex + 1;
    
    // 진행바 및 텍스트 업데이트
    document.getElementById('progress-bar').style.width = `${(current / total) * 100}%`;
    document.getElementById('progress-text').textContent = `문제 ${current} / ${total}`;
    
    // 문제 출력
    const container = document.getElementById('question-container');
    const userAns = engine.getUserAnswer();
    
    let choicesHtml = q.choices.map((choice, i) => `
        <label class="choice-label">
            <input type="radio" name="choice" value="${i+1}" ${userAns === (i+1) ? 'checked' : ''}>
            ${choice}
        </label>
    `).join('');
    
    container.innerHTML = `
        <div class="question-text">Q${current}. ${q.question}</div>
        <div class="choice-container">${choicesHtml}</div>
    `;

    // 라디오 버튼 세팅
    container.querySelectorAll('input[name="choice"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            engine.setUserAnswer(parseInt(e.target.value));
            QuizStorage.saveAnswers(engine.userAnswers);
        });
    });

    // 버튼 노출 제어
    document.getElementById('prev-btn').style.visibility = engine.currentIndex === 0 ? 'hidden' : 'visible';
    if (engine.isLast()) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('submit-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('submit-btn').classList.add('hidden');
    }
}

// 네비게이션 버튼들
document.getElementById('prev-btn').addEventListener('click', () => { engine.prev(); renderQuestion(); });
document.getElementById('next-btn').addEventListener('click', () => { engine.next(); renderQuestion(); });

// 채점 기능
document.getElementById('submit-btn').addEventListener('click', () => {
    const res = engine.score();
    quizSec.classList.add('hidden');
    resultSec.classList.remove('hidden');
    
    document.getElementById('total-score').textContent = `${res.score}점`;
    document.getElementById('score-summary').textContent = `맞은 문제: ${res.correct}개 / 틀린 문제: ${res.wrong}개`;
    
    const wrongContainer = document.getElementById('incorrect-answers-container');
    if (res.wrongs.length === 0) {
        wrongContainer.innerHTML = "<p>🎉 다 맞았습니다! 틀린 문제가 없습니다.</p>";
    } else {
        wrongContainer.innerHTML = res.wrongs.map(w => `
            <div class="wrong-item">
                <div class="question-text" style="font-size:16px;">[문제 ${w.question.id}] ${w.question.question}</div>
                <div class="wrong-ans-info" style="color:var(--danger)">❌ 내가 고른 답: ${w.userAns ? w.question.choices[w.userAns-1] : '선택 안 함'}</div>
                <div class="wrong-ans-info" style="color:var(--success)">✅ 정답: ${w.question.choices[w.question.answer-1]}</div>
                <div class="exp-box">💡 해설: ${w.question.explanation}</div>
            </div>
        `).join('');
    }
});

// PDF / 리스타트
document.getElementById('download-pdf-btn').addEventListener('click', () => { PDFGen.download('pdf-area', engine.title); });
document.getElementById('restart-btn').addEventListener('click', () => {
    QuizStorage.clear();
    resultSec.classList.add('hidden');
    uploadSec.classList.remove('hidden');
    fileInput.value = '';
});

// 새로고침 복구 로직
window.addEventListener('DOMContentLoaded', () => {
    const savedData = QuizStorage.getQuizData();
    if (savedData) {
        initQuiz(savedData, QuizStorage.getAnswers());
    }
    // 서비스 워커 등록 (PWA 설치)
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js').catch(() => {}); }
});
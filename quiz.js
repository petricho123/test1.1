export class QuizEngine {
    constructor(quizData, savedAnswers = []) {
        this.title = quizData.title;
        this.questions = quizData.questions;
        this.userAnswers = savedAnswers.length ? savedAnswers : new Array(quizData.questions.length).fill(null);
        this.currentIndex = 0;
    }
    getCurrentQuestion() { return this.questions[this.currentIndex]; }
    setUserAnswer(val) { this.userAnswers[this.currentIndex] = val; }
    getUserAnswer() { return this.userAnswers[this.currentIndex]; }
    next() { if (this.currentIndex < this.questions.length - 1) this.currentIndex++; }
    prev() { if (this.currentIndex > 0) this.currentIndex--; }
    isLast() { return this.currentIndex === this.questions.length - 1; }
    
    score() {
        let correct = 0;
        const wrongs = [];
        this.questions.forEach((q, i) => {
            if (this.userAnswers[i] === q.answer) correct++;
            else wrongs.push({ question: q, userAns: this.userAnswers[i] });
        });
        return {
            score: Math.round((correct / this.questions.length) * 100),
            correct, wrong: this.questions.length - correct, wrongs
        };
    }
}
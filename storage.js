export const QuizStorage = {
    saveAnswers(answers) { localStorage.setItem('quiz_ans', JSON.stringify(answers)); },
    getAnswers() { return JSON.parse(localStorage.getItem('quiz_ans')) || []; },
    saveQuizData(data) { localStorage.setItem('quiz_data', JSON.stringify(data)); },
    getQuizData() { return JSON.parse(localStorage.getItem('quiz_data')); },
    clear() { localStorage.removeItem('quiz_ans'); localStorage.removeItem('quiz_data'); }
};
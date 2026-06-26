export const QuizParser = {
    parse(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.title || !Array.isArray(data.questions)) throw new Error("형식이 올바르지 않습니다.");
            
            data.questions.forEach((q, i) => {
                if (typeof q.id !== 'number' || !q.question || q.choices.length !== 4 || typeof q.answer !== 'number' || !q.explanation) {
                    throw new Error(`${i+1}번 문제의 데이터 규격에 오류가 있습니다.`);
                }
            });
            return data;
        } catch (e) {
            alert("⚠️ 유효한 시험지 JSON 파일이 아닙니다:\n" + e.message);
            return null;
        }
    }
};
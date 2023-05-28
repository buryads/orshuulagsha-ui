export type quizQuestion = {
  question: string;
  answers: string[4];
  correctAnswer: number;
  yourAnswer?: number;
};

export type quizQuestionsApiResponse = {
  data: quizQuestion[];
  meta: {
    count: number;
  };
};

export type quizQuestionsResponse = {
  questions: quizQuestion[];
  count: number;
};

export interface IQuiz {
  getQuizQuestions: () => Promise<quizQuestionsResponse>;
}

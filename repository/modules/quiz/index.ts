import HttpFactory from '~/repository/factory';
import type {
  IQuiz,
  quizQuestionsApiResponse,
} from '~/repository/modules/quiz/types';

class QuizModule extends HttpFactory implements IQuiz {
  public readonly RESOURCE = '/api/quiz/questions';

  async getQuizQuestions() {
    try {
      const { data }: { data: quizQuestionsApiResponse } = await this.call(
        'GET',
        `${this.RESOURCE}`,
      );

      return {
        questions: data.data,
        count: data.meta.count,
      };
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default QuizModule;

import HttpFactory from '~/repository/factory';
import {
  IQuiz,
  quizQuestionsApiResponse,
} from '~/repository/modules/quiz/types';

class QuizModule extends HttpFactory implements IQuiz {
  public readonly RESOURCE = '/api/quiz/questions';

  async getQuizQuestions() {
    try {
      const response: quizQuestionsApiResponse = await this.call(
        'GET',
        `${this.RESOURCE}`,
      );

      return {
        questions: response.data,
        count: response.meta.count,
      };
    } catch (error) {
      console.error(error);

      throw error;
    }
  }
}

export default QuizModule;

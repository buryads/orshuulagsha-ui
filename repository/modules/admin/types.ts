import type { trainingPackQuiz } from '~/repository/modules/types';
import type { IUser, Pack } from '~/repository/modules/user/types';
import type { TranslationType } from '~/types/types';

export interface TranslationLog {
  id: number;
  method:
    | 'App\\Services\\BurToRuTranslateService'
    | 'App\\Services\\RuToBurTranslateService';
  translation_source: string;
  results_count: number;
  created_at: string;
  updated_at: string;
  ignore: 1 | 0;
  location_name: string;
  user_agent: string;
}

export interface TranslationLogParams {
  limit?: number;
  offset?: number;
  ignored?: '1' | null;
  status?: '1' | '0' | null;
  type?: TranslationType | null;
}

export interface AdminModuleInterface {
  getTranslationLogs: (
    params: TranslationLogParams,
  ) => Promise<TranslationLog[]>;
  ignoreTranslationLog: (id: number) => Promise<TranslationLog[]>;
  getTranslationsCount: (type?: TranslationType) => Promise<number>;
}

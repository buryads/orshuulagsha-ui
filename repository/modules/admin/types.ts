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

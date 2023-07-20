import bur from './i18n/bur.json';
import en from './i18n/en.json';
import kr from './i18n/kr.json';
import ru from './i18n/ru.json';
import se from './i18n/se.json';
import ua from './i18n/ua.json';

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'ru',
  messages: {
    bur,
    en,
    kr,
    ru,
    se,
    ua,
  },
}));

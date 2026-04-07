import WebApp from '@twa-dev/sdk';

export { WebApp };

export const getTelegramUser = () => {
  // Проверяем, доступны ли данные пользователя (запущено ли в Telegram)
  if (WebApp.initDataUnsafe?.user) {
    return WebApp.initDataUnsafe.user;
  }

  // Если запущено в браузере (для тестов)
  // Раскомментируйте объект ниже для тестирования вне Telegram
  /*
  return {
    id: 123456789,
    first_name: "Test",
    last_name: "User",
    username: "test_user",
    language_code: "ru",
    is_premium: false,
  };
  */

  return null;
};

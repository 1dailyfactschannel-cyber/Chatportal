import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../services/api';

export const LoginScreen = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleDemoLogin = () => {
    login(
      { id: '1', username: 'demo', displayName: 'Demo User', createdAt: new Date().toISOString() },
      'demo-token'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Заполните все поля');
      return;
    }
    
    if (isRegister && !email) {
      setError('Введите email');
      return;
    }

    setLoading(true);
    
    try {
      if (isRegister) {
        const { user, token } = await authApi.register(username, email, password);
        login(user, token);
      } else {
        const { user, token } = await authApi.login(username, password);
        login(user, token);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка соединения с сервером');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#ffffff] dark:bg-[#17212b]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0088cc] flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0088cc]">Messenger</h1>
          <p className="text-[#999999] dark:text-[#708499] mt-2">
            {isRegister ? 'Создайте аккаунт' : 'Войдите в аккаунт'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Юзернейм"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5f5f5] dark:bg-[#2f3e50] rounded-lg text-[14px] text-[#000000] dark:text-[#ffffff] placeholder-[#a0a0a0] outline-none focus:ring-2 focus:ring-[#0088cc]"
            />
          </div>
          
          {isRegister && (
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#f5f5f5] dark:bg-[#2f3e50] rounded-lg text-[14px] text-[#000000] dark:text-[#ffffff] placeholder-[#a0a0a0] outline-none focus:ring-2 focus:ring-[#0088cc]"
              />
            </div>
          )}
          
          <div>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5f5f5] dark:bg-[#2f3e50] rounded-lg text-[14px] text-[#000000] dark:text-[#ffffff] placeholder-[#a0a0a0] outline-none focus:ring-2 focus:ring-[#0088cc]"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0088cc] hover:bg-[#006699] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-[#0088cc] hover:underline text-sm"
          >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-[#e0e0e0] dark:border-[#2f3e50]">
          <button
            onClick={handleDemoLogin}
            className="w-full py-2 border border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc] hover:text-white font-semibold rounded-lg transition-colors"
          >
            Войти в демо режим
          </button>
        </div>
      </div>
    </div>
  );
};

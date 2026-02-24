# Анамнез

Медицинская платформа с разделами: Диагноз, История, Ординатура, Долголетие, Новости.

## Стек
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **БД**: Supabase (PostgreSQL)
- **Деплой**: Railway

## Быстрый старт

```bash
# 1. Клонируй репо
git clone https://github.com/Paveliagodkin/anamnez.git
cd anamnez

# 2. Backend
cd backend
cp .env.example .env
# заполни .env своими ключами Supabase
npm install
npm run dev

# 3. Frontend (в новом терминале)
cd frontend
cp .env.example .env
# заполни VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Переменные окружения

### Backend (.env)
```
PORT=3001
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-random-secret-32chars
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Деплой на Railway
1. Подключи GitHub репо в Railway
2. Создай два сервиса: `backend` и `frontend`
3. Добавь переменные из .env в Railway → Variables
4. Railway сам задеплоит при каждом пуше в main

FROM node:20-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S appuser && adduser -S appuser -u 1001
RUN chown -R appuser:appuser /app
USER appuser

# Устанавливаем переменные окружения
ENV NODE_ENV=development
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=5173

# Открываем порт
EXPOSE 5173

# Запускаем в режиме разработки с hot reload
CMD ["npm", "run", "dev"]
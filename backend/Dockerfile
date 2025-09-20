FROM node:20

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Создаем пользователя для безопасности
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Устанавливаем переменные окружения
ENV PORT=3000
ENV NODE_ENV=development

# Открываем порт
EXPOSE 3000

# Запускаем в режиме разработки с hot reload
CMD [ "npm", "run", "dev" ]


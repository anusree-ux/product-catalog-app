FROM python:3.12-alpine

RUN addgroup -g 10001 appuser && adduser -u 10001 -G appuser -D appuser

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R appuser:appuser /app

USER 10001

EXPOSE 5000

CMD ["python", "app.py"]

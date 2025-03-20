FROM python:3.10-alpine

WORKDIR /app

COPY ./parsing/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./parsing/index.json .
COPY ./parsing/ssdw-small.json .
COPY ./parsing/json_into_elastic.py .

CMD ["python", "json_into_elastic.py"]
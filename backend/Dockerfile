# LectureFlow API - AWS Lambda Container
FROM public.ecr.aws/lambda/python:3.12

# Install FFmpeg from static binary
RUN dnf install -y tar xz && \
    curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz | \
    tar -xJ --strip-components=1 -C /usr/local/bin --wildcards '*/ffmpeg' '*/ffprobe' && \
    dnf clean all

# Copy requirements and install dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

# Copy application code
COPY app/ ${LAMBDA_TASK_ROOT}/app/

# Set correct permissions for Lambda
RUN chmod -R 755 ${LAMBDA_TASK_ROOT}

# Set the handler (Mangum wraps FastAPI)
CMD ["app.main.handler"]

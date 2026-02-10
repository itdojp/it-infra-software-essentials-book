FROM ruby:3.2-alpine

# Install dependencies
RUN apk add --no-cache \
    build-base \
    git \
    nodejs \
    npm \
    tzdata

# Set working directory
WORKDIR /app

# Copy Gemfile first for better caching
COPY docs/Gemfile* ./docs/

# Install Ruby dependencies
RUN cd docs && bundle install

# Copy the rest of the application
COPY . .

# Install Node dependencies if package.json exists
RUN if [ -f package.json ]; then npm install; fi

# Expose ports
EXPOSE 4000 35729

# Default command
CMD ["sh", "-c", "cd docs && bundle exec jekyll serve --host 0.0.0.0 --livereload"]

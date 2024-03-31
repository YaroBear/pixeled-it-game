# Use the official PostgreSQL image as the base image
FROM postgres:latest

# Set environment variables for PostgreSQL
ENV POSTGRES_USER myuser
ENV POSTGRES_PASSWORD mypassword
ENV POSTGRES_DB pixeled-it

# Copy any initialization scripts to the Docker image
# Copy the init.sql file to the /docker-entrypoint-initdb.d/ directory
COPY db/migrations/init.sql /docker-entrypoint-initdb.d/

# Expose the PostgreSQL port
EXPOSE 5432
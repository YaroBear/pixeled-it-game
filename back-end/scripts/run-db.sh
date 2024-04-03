docker build -f Dockerfile -t pixeled-it-db .

docker run --rm -p 5432:5432 --name pixeled-it pixeled-it-db

# Export the environment variables as shell environment variables
export PGUSER=myuser
export PGPASSWORD=mypassword
export PGDATABASE=pixeled-it
docker build -t smltg/parser .
docker run -it --network="host" smltg/parser
pause
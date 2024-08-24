# Receipt Processor

This is my solution to the challenge.

The architecture is kept as simple as possible, though it could be made more complex by incorporating elements such as Hexagonal Architecture, the CQRS pattern, data validators like Express Validator, or even by using a different framework like NestJS.

To start the project and test it, simply follow these steps:

## Build Docker image

`docker build -f Dockerfile -t carlosperez/receipt-processor-challenge .`

## Run Docker Image

`docker run -p 8080:8080 carlosperez/receipt-processor-challenge`

In the root of the repository, you’ll find a Postman collection that makes it easier to call the endpoints and test them.

[Postman Collection](Receipt_Porcessor_Challenge.postman_collection.json)

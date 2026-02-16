FROM golang:1.21-alpine

WORKDIR /app

# Install git (needed for go mod download)
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod ./
RUN go mod download

# Copy source code
COPY . .

EXPOSE 8080

CMD ["go", "run", "."]

.PHONY: install start stop clean test lint docker-build docker-up

install:
	@echo "Installing monorepo dependencies..."
	npm install

start:
	@echo "Starting application with Docker Compose..."
	docker-compose up -d

local-start:
	@echo "Starting all services locally (Ctrl+C to stop)..."
	npm start

stop:
	@echo "Stopping application..."
	docker-compose down

clean:
	@echo "Cleaning node_modules..."
	rm -rf node_modules packages/backend/services/*/node_modules packages/frontend/*/node_modules packages/backend/shared/node_modules

test:
	@echo "Running tests..."
	npm run test --workspaces --if-present

lint:
	@echo "Linting..."
	npm run lint --workspaces --if-present

docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-up:
	@echo "Starting Docker containers..."
	docker-compose up

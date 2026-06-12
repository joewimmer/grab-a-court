.PHONY: install dev run db-seed test test-coverage lint build clean docker-up docker-down docker-reset-db help

help:
	@echo "Grab A Court - Country Club Tennis Reservation Demo"
	@echo ""
	@echo "  make install   Install all dependencies"
	@echo "  make dev       Run frontend and backend in development mode"
	@echo "  make run       Build and run the app locally"
	@echo "  make db-seed   Create/reset and seed the SQLite database"
	@echo "  make test           Run all tests"
	@echo "  make test-coverage  Run tests with coverage reports"
	@echo "  make lint      Run lint checks"
	@echo "  make build     Build frontend and backend"
	@echo "  make clean     Remove build artifacts and database"
	@echo "  make docker-up       Build and start Docker Compose stack"
	@echo "  make docker-down     Stop Docker Compose stack"
	@echo "  make docker-reset-db Reset demo data in the Docker volume"

install:
	npm install

dev: db-seed
	npm run dev

run: build db-seed
	npm run run

db-seed:
	npm run db:seed

test:
	npm run test

test-coverage:
	npm run test:coverage

lint:
	npm run lint

build:
	npm run build

clean:
	rm -rf backend/dist frontend/dist database/grab-a-court.db

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

docker-reset-db:
	docker compose stop backend
	docker compose run --rm -e SEED_RESET=true seed
	docker compose start backend

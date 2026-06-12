.PHONY: install dev run db-seed test lint build clean help

help:
	@echo "Grab A Court - Country Club Tennis Reservation Demo"
	@echo ""
	@echo "  make install   Install all dependencies"
	@echo "  make dev       Run frontend and backend in development mode"
	@echo "  make run       Build and run the app locally"
	@echo "  make db-seed   Create/reset and seed the SQLite database"
	@echo "  make test      Run all tests"
	@echo "  make lint      Run lint checks"
	@echo "  make build     Build frontend and backend"
	@echo "  make clean     Remove build artifacts and database"

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

lint:
	npm run lint

build:
	npm run build

clean:
	rm -rf backend/dist frontend/dist database/grab-a-court.db

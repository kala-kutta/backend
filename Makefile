.PHONY: build run run-detached

build:
	@docker build --pull -t final-proj-backend .

run:
	@docker run -p 3000:3000 -p 4000:4000 final-proj-backend

run-detached:
	@docker run -d -p 3000:3000 -p 4000:4000 final-proj-backend
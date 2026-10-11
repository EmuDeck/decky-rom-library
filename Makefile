ifneq (,$(wildcard ./.env))
	include .env
	export
endif

SHELL=bash

.PHONY: help vendor env init update-lib build-front build ssh-keygen copy-ssh-key deploy-steamdeck restart-decky deploy it cleanup uninstall-plugin

help: ## Display available tasks
	@echo "+ $@"
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z0-9_-]+:.*## / {printf "\033[36m%-24s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

vendor: ## Install project dependencies
	@echo "+ $@"
	@pnpm i

env: ## Create default .env file if missing
	@echo "+ $@"
	@if [ -f .env ]; then \
		echo ".env already exists; preserving it."; \
	else \
		{ printf '%s\n' '# Makefile tools' 'DECK_USER=deck' 'DECK_HOST=' 'DECK_PORT=22' 'DECK_HOME=/home/deck' 'DECK_KEY=~/.ssh/decky-rom-library'; \
		  printf 'PLUGIN_FOLDER=%s\n' "$$(jq -r .name package.json)"; } > .env; \
		echo "Created .env; configure DECK_HOST before deploying."; \
	fi

init: ## Initialize project
	@$(MAKE) env
	@$(MAKE) vendor
	@echo -e "\n\033[1;36m Almost ready! Just a few things left to do:\033[0m\n"
	@echo -e "1. Configure DECK_HOST and other connection settings in .env."
	@echo -e "2. Run \`\033[0;36mmake ssh-keygen\033[0m\` to create the local key if needed."
	@echo -e "3. Run \`\033[0;36mmake copy-ssh-key\033[0m\` to copy the public key to the Deck."
	@echo -e "4. Build with \`\033[0;36mmake build\033[0m\` and deploy with \`\033[0;36mmake deploy\033[0m\`."

update-lib: ## Update decky-frontend-lib
	@echo "+ $@"
	@pnpm update decky-frontend-lib --latest

build: ## Build frontend
	@echo "+ $@"
	@pnpm run build

ssh-keygen: ## Generate the configured SSH key without a passphrase
	@echo "+ $@"
	@key='$(DECK_KEY)'; key="$${key/#\~/$$HOME}"; \
	if [[ -z "$$key" ]]; then \
		echo "DECK_KEY is unset; run make env and configure .env first." >&2; exit 1; \
	fi; \
	if [[ -e "$$key" || -e "$$key.pub" ]]; then \
		if [[ -f "$$key" && -f "$$key.pub" ]]; then \
			echo "SSH key pair already exists at $$key; preserving it."; \
		else \
			echo "SSH key path or public key already exists but the pair is incomplete: $$key" >&2; exit 1; \
		fi; \
	else \
		mkdir -p "$$(dirname "$$key")" && ssh-keygen -N '' -f "$$key"; \
	fi

copy-ssh-key: ## Copy public ssh key to steamdeck
	@echo "+ $@"
	@ssh-copy-id -i $(DECK_KEY) $(DECK_USER)@$(DECK_HOST)

deploy-steamdeck: ## Deploy plugin build to steamdeck
	@echo "+ $@"
	@bash ./scripts/deploy-steamdeck.sh

restart-decky: ## Restart Decky on remote steamdeck
	@echo "+ $@"
	@ssh -t $(DECK_USER)@$(DECK_HOST) -p $(DECK_PORT) -i $(DECK_KEY) \
 		'sudo systemctl restart plugin_loader.service'
	@echo -e '\033[0;32m+ all is good, restarting Decky...\033[0m'

deploy: ## Deploy code to steamdeck and restart Decky
	@bash ./scripts/deploy-steamdeck.sh --restart

it: ## Build all code, deploy it to steamdeck, restart Decky
	@$(MAKE) build deploy

cleanup: ## Delete all generated files and folders
	@echo "+ $@"
	@rm -rf ./dist
	@rm -rf ./tmp
	@rm -rf ./node_modules
	@rm -rf ./.pnpm-store

uninstall-plugin: ## Uninstall plugin from steamdeck, restart Decky
	@echo "+ $@"
	@ssh -t $(DECK_USER)@$(DECK_HOST) -p $(DECK_PORT) -i $(DECK_KEY) \
 		"sudo sh -c 'rm -rf $(DECK_HOME)/homebrew/plugins/$(PLUGIN_FOLDER)/ && systemctl restart plugin_loader.service'"
	@echo -e '\033[0;32m+ all is good, restarting Decky...\033[0m'

# EmuDeck Rom Launcher

This is a fork of the amazing plugin https://github.com/jessebofill/DeckWebBrowser.git.

It's been heavily modified to be used to launch games for EmuDeck users.

## Development and deployment

Run `make init`, then set `DECK_HOST` in `.env` to the Steam Deck's hostname or IP address. Generate and install the configured SSH key with:

```sh
make ssh-keygen
make copy-ssh-key
```

Build and deploy with `make it`, or run `make build` and `make deploy` separately. Deployment uses a temporary staging directory and requests `sudo` on the Deck to install the plugin and restart Decky. The staging directory is removed after the deployment attempt.

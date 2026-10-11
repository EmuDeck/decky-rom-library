#!/usr/bin/env bash
set -Eeuo pipefail

# Parse the optional restart flag.
restart_decky=0
case "${1:-}" in
  "") ;;
  --restart) restart_decky=1 ;;
  *)
    printf 'Usage: %s [--restart]\n' "$0" >&2
    exit 2
    ;;
esac
if (( $# > 1 )); then
  printf 'Usage: %s [--restart]\n' "$0" >&2
  exit 2
fi

# Read deployment settings exported by Make from .env.
DECK_USER=${DECK_USER:-deck}
DECK_PORT=${DECK_PORT:-22}
DECK_HOME=${DECK_HOME:-/home/deck}
: "${DECK_HOST:?Set DECK_HOST in .env before deploying.}"
: "${DECK_KEY:?Set DECK_KEY in .env before deploying.}"
: "${PLUGIN_FOLDER:?Set PLUGIN_FOLDER in .env before deploying.}"

if [[ ! "$DECK_PORT" =~ ^[0-9]+$ ]] || (( DECK_PORT < 1 || DECK_PORT > 65535 )); then
  printf 'Invalid DECK_PORT: %s\n' "$DECK_PORT" >&2
  exit 2
fi
if [[ "$DECK_HOME" != /* ]]; then
  printf 'DECK_HOME must be an absolute path: %s\n' "$DECK_HOME" >&2
  exit 2
fi
if [[ ! "$PLUGIN_FOLDER" =~ ^[A-Za-z0-9._-]+$ || "$PLUGIN_FOLDER" == . || "$PLUGIN_FOLDER" == .. ]]; then
  printf 'PLUGIN_FOLDER must be a single safe directory name: %s\n' "$PLUGIN_FOLDER" >&2
  exit 2
fi

# Expand a leading tilde from .env without expanding tildes elsewhere.
case "$DECK_KEY" in
  '~') deck_key=$HOME ;;
  '~/'*) deck_key="$HOME/${DECK_KEY:2}" ;;
  *) deck_key=$DECK_KEY ;;
esac
if [[ ! -f "$deck_key" ]]; then
  printf 'SSH private key not found: %s (run make ssh-keygen if needed)\n' "$deck_key" >&2
  exit 2
fi

for required_command in ssh rsync; do
  if ! command -v "$required_command" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "$required_command" >&2
    exit 127
  fi
done

# Resolve paths and connection arguments once for all SSH calls.
repository_root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
cd "$repository_root"

deck_connection="$DECK_USER@$DECK_HOST"
plugin_directory="${DECK_HOME%/}/homebrew/plugins/$PLUGIN_FOLDER"
staging_prefix="/tmp/$PLUGIN_FOLDER.deploy."
staging_directory=
ssh_options=(-p "$DECK_PORT" -i "$deck_key" -o BatchMode=no)

# Quote a value so it can safely be embedded in a remote shell command.
quote_for_shell() {
  local value=${1//\'/\'\\\'\'}
  printf "'%s'" "$value"
}

cleanup_staging_directory() {
  local deploy_status=$?
  trap - EXIT

  if [[ -n "$staging_directory" ]]; then
    if ! ssh -T "${ssh_options[@]}" "$deck_connection" \
      "rm -rf -- $(quote_for_shell "$staging_directory")" >/dev/null; then
      printf 'Warning: could not confirm removal of remote staging directory %s\n' \
        "$staging_directory" >&2
    fi
  fi

  exit "$deploy_status"
}

create_staging_directory() {
  staging_directory=$(ssh -T "${ssh_options[@]}" "$deck_connection" \
    "umask 077 && mktemp -d $(quote_for_shell "${staging_prefix}XXXXXXXX")")

  local staging_suffix=${staging_directory#"$staging_prefix"}
  if [[ "$staging_directory" != "$staging_prefix"* ||
    ${#staging_suffix} -ne 8 || ! "$staging_suffix" =~ ^[A-Za-z0-9]+$ ]]; then
    printf 'Deck returned an invalid staging path: %s\n' "$staging_directory" >&2
    exit 1
  fi
}

upload_to_staging_directory() {
  local rsync_ssh_command
  printf -v rsync_ssh_command 'ssh -p %q -i %q -o BatchMode=no' \
    "$DECK_PORT" "$deck_key"

  # Keep this list in sync with the exclusions in the privileged install below.
  local excludes=(
    --exclude=.git/
    --exclude=.github/
    --exclude=.vscode/
    --exclude=node_modules/
    --exclude=.pnpm-store/
    --exclude=src/
    --exclude='*.log'
    --exclude=.gitignore
    --exclude=.idea
    --exclude=.env
    --exclude=Makefile
  )

  rsync -azp --delete --progress \
    --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rwx,Fg=rx,Fo=rx \
    -e "$rsync_ssh_command" "${excludes[@]}" \
    ./ "$deck_connection:$staging_directory/"
}

build_privileged_install_script() {
  cat <<'INSTALL_SCRIPT'
set -Eeuo pipefail

plugin_directory=$1
staging_directory=$2
restart_decky=$3

install -d -m 755 -- "$plugin_directory"

# Keep these exclusions in sync with the upload list above. --delete only
# applies inside this plugin's directory, and excluded target files are kept.
rsync -azp --no-owner --no-group --delete \
  --chmod=Du=rwx,Dg=rx,Do=rx,Fu=rwx,Fg=rx,Fo=rx \
  --exclude=.git/ \
  --exclude=.github/ \
  --exclude=.vscode/ \
  --exclude=node_modules/ \
  --exclude=.pnpm-store/ \
  --exclude=src/ \
  --exclude='*.log' \
  --exclude=.gitignore \
  --exclude=.idea \
  --exclude=.env \
  --exclude=Makefile \
  -- "$staging_directory/" "$plugin_directory/"

if [[ "$restart_decky" == 1 ]]; then
  systemctl restart plugin_loader.service
fi
INSTALL_SCRIPT
}

build_remote_runner() {
  cat <<'REMOTE_RUNNER'
set -Eeuo pipefail

staging_directory=$1
plugin_directory=$2
restart_decky=$3
install_script=$4

# This trap also cleans staging if sudo is refused or installation fails.
trap 'rm -rf -- "$staging_directory"' EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

sudo bash -c "$install_script" deploy \
  "$plugin_directory" "$staging_directory" "$restart_decky"
REMOTE_RUNNER
}

run_privileged_install() {
  local install_script remote_runner remote_command
  install_script=$(build_privileged_install_script)
  remote_runner=$(build_remote_runner)

  remote_command="bash -c $(quote_for_shell "$remote_runner") -- \
    $(quote_for_shell "$staging_directory") \
    $(quote_for_shell "$plugin_directory") \
    $(quote_for_shell "$restart_decky") \
    $(quote_for_shell "$install_script")"

  ssh -tt "${ssh_options[@]}" "$deck_connection" "$remote_command"
}

# Local cleanup handles transfer failures; the remote trap handles install failures.
trap cleanup_staging_directory EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

create_staging_directory
upload_to_staging_directory
run_privileged_install

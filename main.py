
import os
import subprocess
import re
import json
from glob import glob
import decky_plugin

def log(txt):
  decky_plugin.logger.info(txt)

def warn(txt):
  decky_plugin.logger.warn(txt)

def error(txt):
  decky_plugin.logger.error(txt)

confdir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]

class Plugin:

    async def _main(self):
        try:
            sc = open(os.path.join(confdir, "scid.txt"), "x")
            sc.close()
        except FileExistsError:
            pass

    async def emudeck(self, command, strip=True, args=[]):
        log("args: " + ", ".join(args))
        bash_command = ". $HOME/.config/EmuDeck/backend/functions/all.sh && " + command
        if len(args) > 0:
            bash_command += " " + " ".join(["\""+arg+"\"" for arg in args])
        log(bash_command)
        result = subprocess.run(bash_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        decky_plugin.logger.info(result)
        decky_plugin.logger.info(result.stdout)
        decky_plugin.logger.info(result.stderr)
        cleaned_stdout = result.stdout.strip()
        return result.stdout.strip() if strip else result.stdout

    # START QL
    async def get_id(self):
        with open(os.path.join(confdir, "scid.txt"), "r") as sc:
            id = sc.read()
            try:
                id = int(id)
                return id
            except ValueError:
                return -1

    async def set_id(self, id):
        with open(os.path.join(confdir, "scid.txt"), "w") as sc:
            sc.write(str(id))
    # END QL
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
if os.name == 'nt':
    appdata_roaming_path = os.getenv('APPDATA')

class Plugin:

    @staticmethod
    async def getSettings(self):
        pattern = re.compile(r'([A-Za-z_][A-Za-z0-9_]*)=(.*)')
        user_home = os.path.expanduser("~")

        if os.name == 'nt':
            config_file_path = os.path.join(user_home, 'AppData', 'Roaming', 'EmuDeck', 'settings.ps1')
        else:
            config_file_path = os.path.join(user_home, 'emudeck', 'settings.sh')

        configuration = {}

        with open(config_file_path, 'r') as file:
            for line in file:
                match = pattern.search(line)
                if match:
                    variable = match.group(1)
                    value = match.group(2).strip().strip('"')
                    expanded_value = os.path.expandvars(value.replace('"', '').replace("'", ""))
                    configuration[variable] = expanded_value

        # Obtener rama actual del repositorio backend
        if os.name == 'nt':
            bash_command = f"cd {appdata_roaming_path}/EmuDeck/backend/ && git rev-parse --abbrev-ref HEAD"
        else:
            bash_command = "cd $HOME/.config/EmuDeck/backend/ && git rev-parse --abbrev-ref HEAD"

        result = subprocess.run(bash_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        configuration["branch"] = result.stdout.strip()

        configuration["systemOS"] = os.name

        json_configuration = json.dumps(configuration, indent=4)
        return json_configuration

    async def emudeck(self, command):
        if os.name == 'nt':
            ps1_file = os.path.join(os.environ['APPDATA'], 'EmuDeck', 'backend', 'functions', 'all.ps1')
            bash_command = fr'PowerShell -ExecutionPolicy Bypass -Command "& {{. \"{ps1_file}\"; {command}}}"'
        else:
            bash_command = f". $HOME/.config/EmuDeck/backend/functions/all.sh && {command}"
        result = subprocess.run(bash_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        cleaned_stdout = result.stdout.strip()
        user_home = os.path.expanduser("~")
        emudeck_log_dir = os.path.join(user_home, 'emudeck')
        os.makedirs(emudeck_log_dir, exist_ok=True)
        log_file_path = os.path.join(emudeck_log_dir, 'decky.log')
        with open(log_file_path, 'w') as archivo:
            archivo.write("STDOUT:\n")
            archivo.write(result.stdout)
            archivo.write("\n\nSTDERR:\n")
            archivo.write(result.stderr)
        return cleaned_stdout

    async def emudeck_dirty(self, command):
        if os.name == 'nt':
            bash_command = f". {appdata_roaming_path}/EmuDeck/backend/functions/all.ps1 ; " + command
        else:
            bash_command = ". $HOME/.config/EmuDeck/backend/functions/all.sh && " + command
        result = subprocess.run(bash_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout
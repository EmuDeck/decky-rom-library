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
    async def getJsonFromPlatform(self, platform):
        """
        Reads and returns the JSON data from the specified path.
        """
        #settings = await getSettings(self)
        #storage_path = settings.get("storagePath")

        storage_path = "/home/deck/Emulation/storage"

        json_path = os.path.join(storage_path, "retrolibrary", "data", f"{platform}.json")

        if not os.path.exists(json_path):
            warn(f"JSON file not found at: {json_path}")
            return {"error": f"File not found: {json_path}"}
        try:
            with open(json_path, 'r') as json_file:
                data = json.load(json_file)
                log(f"Loaded {len(data.get('games', []))} games from JSON.")
                return data  # Retorna el contenido completo del JSON
        except Exception as e:
            error(f"Error reading JSON file: {e}")
            return {"error": str(e)}

    async def getSettings(self):
        pattern = re.compile(r'([A-Za-z_][A-Za-z0-9_]*)=(.*)')
        user_home = os.path.expanduser("~")
        if os.name == 'nt':
            config_file_path = os.path.join(user_home, 'emudeck', 'settings.ps1')
        else:
            config_file_path = os.path.join(user_home, 'emudeck', 'settings.sh')
        configuration = {}

        with open(config_file_path, 'r') as file:
            for line in file:
                match = pattern.search(line)
                if match:
                    variable = match.group(1)
                    value = match.group(2).strip('"')
                    configuration[variable] = value

        if os.name == 'nt':
            bash_command = f"cd {appdata_roaming_path}/EmuDeck/backend/ && git rev-parse --abbrev-ref HEAD"
        else:
            bash_command = "cd $HOME/.config/EmuDeck/backend/ && git rev-parse --abbrev-ref HEAD"
        result = subprocess.run(bash_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        configuration["branch"] = result.stdout.strip()

        configuration["systemOS"] = os.name

        json_configuration = json.dumps(configuration, indent=4)
        return json_configuration

    async def _main(self):
        try:
            sc = open(os.path.join(confdir, "scid_1.txt"), "x")
            sc.close()
        except FileExistsError:
            pass

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

    # START QL
    async def get_id(self, id_file):
        with open(os.path.join(confdir, f'scid_{id_file}.txt'), "r") as sc:
            id = sc.read()
            try:
                id = int(id)
                return id
            except ValueError:
                return -1

    async def set_id(self, id, id_file):
        with open(os.path.join(confdir, f'scid_{id_file}.txt'), "w") as sc:
            sc.write(str(id))
    # END QL

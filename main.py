import os, json, platform
import subprocess
import re
from glob import glob
from pathlib import Path
import decky_plugin


def log(txt):
    decky_plugin.logger.info(txt)


def warn(txt):
    decky_plugin.logger.warn(txt)


def error(txt):
    decky_plugin.logger.error(txt)


mode = "LEGACY"  # Bash or python?
confdir = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
system = platform.system().lower()  # 'linux', 'darwin', 'windows'
home = Path.home()
emudeck_backend = home / ".config/EmuDeck/backend"
emudeck_folder = home / ".config/EmuDeck"
emudeck_logs = home / ".config/EmuDeck/logs/"
temp_dir = home / "Downloads"
app_folder = home / "Applications"
emus_folder = app_folder
esde_folder = app_folder
pegasus_folder = app_folder

if system.startswith("win"):
    appdata_roaming = Path(os.environ.get("APPDATA"))
    emudeck_backend = Path(os.path.expandvars(appdata_roaming / "EmuDeck/backend"))
    emudeck_folder = Path(os.path.expandvars(appdata_roaming / "EmuDeck"))
    emudeck_logs = Path(os.path.expandvars(appdata_roaming / "EmuDeck/logs"))
    emudeck_temp = Path(os.path.expandvars(appdata_roaming / "EmuDeck/temp"))
    app_folder = Path(os.path.expandvars(emudeck_folder / "Emulators"))
    emus_folder = Path(os.path.expandvars(app_folder))
    esde_folder = Path(os.path.expandvars(emudeck_folder / "EmulationStation-DE"))
    pegasus_folder = Path(os.path.expandvars(emudeck_folder / "Pegasus"))


class Plugin:
    @staticmethod
    async def getSettings(self):
        return True
        if system.startswith("win"):
            bash_command = f"cd {appdata_roaming}/EmuDeck/backend/ && git rev-parse --abbrev-ref HEAD"
        else:
            bash_command = (
                "cd $HOME/.config/EmuDeck/backend/ && git rev-parse --abbrev-ref HEAD"
            )
        result = subprocess.run(
            bash_command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        branch = result.stdout.strip()

        file_path = Path("$HOME/.config/EmuDeck/backend/functions/appImageInit.sh")
        if system.startswith("win"):
            file_path = Path(f"{appdata_roaming}/EmuDeck/backend/functions/all.ps1")

        if file_path.exists():
            mode = "LEGACY"
        else:
            mode = "CURRENT"



        if mode == "LEGACY":
            pattern = re.compile(r"([A-Za-z_][A-Za-z0-9_]*)=(.*)")
            user_home = os.path.expanduser("~")
            if system.startswith("win"):
                config_file_path = os.path.join(user_home, "emudeck", "settings.ps1")
            else:
                config_file_path = os.path.join(
                    user_home, ".config/EmuDeck", "settings.sh"
                )
            configuration = {}

            with open(config_file_path, "r") as file:
                for line in file:
                    match = pattern.search(line)
                    if match:
                        variable = match.group(1)
                        value = match.group(2).strip('"')
                        configuration[variable] = value

            configuration["systemOS"] = os.name
            configuration["branch"] = branch

            json_configuration = json.dumps(configuration, indent=4)
            return json_configuration
        else:

            json_settings_path = Path(emudeck_folder) / "settings.json"
            if json_settings_path.exists():
                with open(json_settings_path, encoding="utf-8") as jf:
                    # Aquí json.load lee y va aplicando object_hook a cada dict
                    settings = json.load(jf, object_hook=lambda d: SimpleNamespace(**d))
                    installationPath = settings.storagePath
                    tools_path = Path(
                        Path(installationPath + "/Emulation/tools")
                    )
                    json_configuration.branch = branch
                    json_configuration["systemOS"] = os.name
                    log(json_configuration)
                    return json_configuration

    async def emudeck(self, command):

        file_path = Path("$HOME/.config/EmuDeck/backend/functions/appImageInit.sh")
        if system.startswith("win"):
            file_path = Path(f"{appdata_roaming}/EmuDeck/backend/functions/all.ps1")

        if file_path.exists():
            mode = "LEGACY"
        else:
            mode = "CURRENT"

        # Determinar el comando según el sistema operativo
        if system.startswith("win"):
            # Obtener la ruta completa del script .ps1 usando Python
            ps1_file = os.path.join(
                os.environ["APPDATA"], "EmuDeck", "backend", "functions", "all.ps1"
            )

            # Construir el comando de PowerShell con la ruta absoluta
            bash_command = rf'PowerShell -ExecutionPolicy Bypass -Command "& {{. \"{ps1_file}\"; {command}}}"'
        else:
            # Para sistemas basados en Unix
            bash_command = (
                f". $HOME/.config/EmuDeck/backend/functions/all.sh && {command}"
            )

        if mode == "CURRENT":

            if "setSetting" in command:
                command = command.split("&&", 1)[1]

            # Command Naming substitution

            if "generateGameLists_artwork" in command:
                command = "rl_get_artwork"

            if "generateGameLists" in command:
                command = "rl_init"

            if "generateGameListsJson" in command:
                command = "rl_print_json"

            if "generateGameLists_getPercentage" in command:
                command = "generate_game_lists_get_percentage"

            if "generateGameLists_retroAchievements" in command:
                command = "rl_get_artwork"

            if "addGameListsArtwork" in command:
                command = command.replace(
                    "addGameListsArtwork", "rl_add_game_lists_artwork"
                )

            if "saveImage" in command:
                command = command.replace("saveImage", "rl_save_game")

            if "Store_installGame" in command:
                command = command.replace("Store_installGame", "store_install_game")

            if "Store_uninstallGame" in command:
                command = command.replace("Store_uninstallGame", "store_uninstall_game")

            if "Store_isGameInstalled" in command:
                command = command.replace(
                    "Store_isGameInstalled", "store_is_game_installed"
                )

            if system.startswith("win"):
                bash_command = f"python {emudeck_backend}/api.py {command}"
            else:
                bash_command = f"python3 {emudeck_backend}/api.py {command}"

        bash_command = f"python3 {emudeck_backend}/api.py {command}"

        log(bash_command)

        result = subprocess.run(
            bash_command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        cleaned_stdout = result.stdout.strip()

        os.makedirs(emudeck_logs, exist_ok=True)

        # Escribir el resultado en un archivo de log
        log_file_path = os.path.join(emudeck_logs, "decky.log")
        with open(log_file_path, "w") as archivo:
            archivo.write("STDOUT:\n")
            archivo.write(result.stdout)
            archivo.write("\n\nSTDERR:\n")
            archivo.write(result.stderr)

        return cleaned_stdout

    async def _main(self):
        file_path = Path("$HOME/.config/EmuDeck/backend/functions/appImageInit.sh")
        if system.startswith("win"):
            file_path = Path(f"{appdata_roaming}/EmuDeck/backend/functions/all.ps1")

        if file_path.exists():
            mode = "LEGACY"
        else:
            mode = "CURRENT"

        if system.startswith("win"):
            bash_command = (
                f"cd {appdata_roaming}/EmuDeck/backend/ && git reset --hard && git pull"
            )
        else:
            bash_command = (
                "cd $HOME/.config/EmuDeck/backend/ && git reset --hard && git pull"
            )
        result = subprocess.run(
            bash_command,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        try:
            sc = open(os.path.join(confdir, "scid.txt"), "x")
            sc.close()
        except FileExistsError:
            pass
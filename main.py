
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

    async def _main(self):
        try:
            sc = open(os.path.join(confdir, "scid.txt"), "x")
            sc.close()
        except FileExistsError:
            pass

    async def emudeck(self, command):
      # Determinar el comando según el sistema operativo
      if os.name == 'nt':
          # Obtener la ruta completa del script .ps1 usando Python
          ps1_file = os.path.join(os.environ['APPDATA'], 'EmuDeck', 'backend', 'functions', 'all.ps1')

          # Construir el comando de PowerShell con la ruta absoluta
          bash_command = fr'PowerShell -ExecutionPolicy Bypass -Command "& {{. \"{ps1_file}\"; {command}}}"'
      else:
          # Para sistemas basados en Unix
          bash_command = f". $HOME/.config/EmuDeck/backend/functions/all.sh && {command}"

      # Ejecutar el comando
      result = subprocess.run(bash_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

      # Limpiar la salida estándar (stdout)
      cleaned_stdout = result.stdout.strip()

      # Obtener la ruta al directorio del usuario y crear la carpeta "emudeck" si no existe
      user_home = os.path.expanduser("~")
      emudeck_log_dir = os.path.join(user_home, 'emudeck')
      os.makedirs(emudeck_log_dir, exist_ok=True)

      # Escribir el resultado en un archivo de log
      log_file_path = os.path.join(emudeck_log_dir, 'decky.log')
      with open(log_file_path, 'w') as archivo:
          archivo.write("STDOUT:\n")
          archivo.write(result.stdout)
          archivo.write("\n\nSTDERR:\n")
          archivo.write(result.stderr)

      return cleaned_stdout

    async def emudeck_dirty(self, command):
      if os.name == 'nt':
          bash_command = f". {appdata_roaming_path}/EmuDeck/backend/functions/all.ps1 && " + command
      else:
          bash_command = ". $HOME/.config/EmuDeck/backend/functions/all.sh && " + command
      result = subprocess.run(bash_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
      return result.stdout


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
import { launchApp } from "./steamshortcuts";

export const getDataGames = async (serverAPI, setState, state) => {
  //console.log("Asking for Games");
  await serverAPI.callPluginMethod("emudeck", { command: `generateGameLists` });

  const jsonUrl = "https://steamloopback.host/customimages/retrolibrary/cache/roms_games.json";

  // Llamada a fetch para obtener los datos
  fetch(jsonUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error al obtener JSON: ${response.statusText}`);
      }
      return response.json(); // Convierte la respuesta en JSON
    })
    .then((data) => {
      console.log("Contenido del JSON:", data); // Muestra los datos en la consola
      data.sort((a: any, b: any) => a.title.localeCompare(b.title));
      const gamesString = JSON.stringify(data);
      sessionStorage.setItem("rom_library_games", gamesString);
      setState({ ...state, games: data });

      serverAPI.callPluginMethod("emudeck", { command: `generateGameListsJson` }).then((response: any) => {});
    })
    .catch((error) => {
      console.error("Error al acceder al JSON:", error); // Manejo de errores
    });
};

export const getDataStates = async (serverAPI, setState, state, name) => {
  const jsonUrl = "https://steamloopback.host/customimages/retrolibrary/cache/saves_states.json";

  // Llamada a fetch para obtener los datos
  fetch(jsonUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error al obtener JSON: ${response.statusText}`);
      }
      return response.json(); // Convierte la respuesta en JSON
    })
    .then((data) => {
      console.log("Contenido del JSON DataStates:", data); // Muestra los datos en la consola
      console.log({ name });
      const filteredResults = data.filter((item) => item.name.includes(name));
      console.log({ filteredResults });
      setState({ ...state, states: filteredResults });
    })
    .catch((error) => {
      console.error("Error al acceder al JSON:", error); // Manejo de errores
    });
};

export const getDataSettings = async (serverAPI, setState, state) => {
  //console.log("Asking for Settings");
  await serverAPI.callPluginMethod("getSettings", {}).then((response: any) => {
    const result: any = response.result;
    const emuDeckConfig: any = JSON.parse(result);
    //console.log({ result });
    //console.log("Saving Settings to State");
    setState({ ...state, emuDeckConfig });
    const emuDeckConfigString = JSON.stringify(emuDeckConfig);
    sessionStorage.setItem("rom_library_settings", emuDeckConfigString);
  });
};

export const checkParserStatus = (serverAPI, setState, interval) => {
  ////console.log("checkCloudStatus");
  serverAPI
    .callPluginMethod("emudeck", { command: "generateGameLists_getPercentage" })
    .then((response: any) => {
      const result = response.result;
      setState(result);
      if (result == "100") {
        clearInterval(interval);
      }
    })
    .catch((error: any) => {
      //console.log({ error });
    });
};

export const launchGame = (
  serverAPI,
  launcher: string,
  game: string,
  name: string,
  platform: string,
  emuDeckConfig
) => {
  const gameKey = `${name}_${platform}`;
  localStorage.setItem("last_selected_game_key", gameKey);

  let launcherComplete = launcher.replace(/{file.path}/g, `'${game}'`);
  if (emuDeckConfig.systemOS == "nt") {
    launcherComplete = launcherComplete
      .replace(
        "powershell -ExecutionPolicy Bypass -NoProfile -File  '",
        `C:\\Windows\\System32\\cmd.exe /k start /min "Loading PowerShell Launcher" "C:\\Windows\\System32\\WindowsPowershell\\v1.0\\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "& {`
      )
      .replace("'", "");
    launcherComplete = launcherComplete.slice(0, -1) + `'}" && exit " && exit --emudeck`;
  } else {
    launcherComplete = launcherComplete
      .replace(/\\"\'/g, "")
      .replace(/'\\\"/g, "")
      .replace(/\\\\/g, "\\")
      .replace(/\\:"/g, '"Z:');
  }
  launchApp(serverAPI, { name, exec: launcherComplete }, emuDeckConfig.systemOS, platform);
};

export const getDataAchievements = async (serverAPI, setState, state, platform, hash) => {
  serverAPI
    .callPluginMethod("emudeck", { command: `generateGameLists_retroAchievements ${hash} ${platform}` })
    .then((response: any) => {
      console.log({ response });
      const result = response.result;
      const achievements: any = JSON.parse(result);

      type Achievement = {
        DateEarned?: string;
        DateEarnedHardcore?: string;
        [key: string]: any; // Para permitir otras propiedades dinámicas
      };
      const isAchievement = (obj: unknown): obj is Achievement => {
        return typeof obj === "object" && obj !== null && ("DateEarned" in obj || "DateEarnedHardcore" in obj);
      };

      let earned = {};
      let earnedHardcore = {};
      let neither = {};

      // Iterar sobre cada entrada del objeto
      Object.entries(achievements.Achievements).forEach(([key, value]) => {
        if (isAchievement(value)) {
          if (value.DateEarned && value.DateEarnedHardcore) {
            earned[key] = value;
          } else if (value.DateEarnedHardcore) {
            earnedHardcore[key] = value;
          } else {
            neither[key] = value;
          }
        }
      });

      let earnedArray = Object.values(earned);
      let earnedHardcoreArray = Object.values(earnedHardcore);
      let neitherArray = Object.values(neither);

      setState({
        ...state,
        achievements,
        earned: earnedArray,
        earnedHardcore: earnedHardcoreArray,
        neither: neitherArray,
      });
    })
    .catch((error: any) => {
      console.log({ error });
    });
};

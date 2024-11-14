// START QL
// Credits: https://github.com/Fisch03/SDH-QuickLaunch

import { ServerAPI, LifetimeNotification } from "decky-frontend-lib";

interface App {
  name: string;
  exec: string;
  compatTool?: string;
}

const createShortcut = (name: string, system: string) => {
  let appFake;
  system == "nt" ? (appFake = "notepad.exe") : (appFake = "/user/bin/fail");

  return SteamClient.Apps.AddShortcut(name, appFake, "", ""); //The Part after the last Slash does not matter because it should always be replaced when launching an app
};

// Convert from ShortAppId to AppId
function lengthenAppId(shortId: string) {
  return String((BigInt(shortId) << BigInt(32)) | BigInt(0x02000000));
}

const getShortcutID = async (sAPI: ServerAPI, system: string) => {
  //No existe contador? iniciamos
  let counter: any;
  if (!localStorage.getItem("rom_library_counter")) {
    counter = 1;
    localStorage.setItem("rom_library_counter", counter);
  }
  counter = localStorage.getItem("rom_library_counter");
  //const result = await sAPI.callPluginMethod<any, number>("get_id", { id_file: counter });
  const savedID = localStorage.getItem(`rom_library_id_${counter}`);
  let id: any;
  if (savedID) {
    id = parseInt(savedID);
    //@ts-ignore
    let game = appStore.GetAppOverviewByAppID(id);
    if (game == null) {
      id = await createShortcut("QuickLaunchEmuDeck", system);
      localStorage.setItem(`rom_library_id_${counter}`, id.toString());
      counter = counter - 1;
    }
  } else {
    id = await createShortcut("QuickLaunchEmuDeck", system);
    localStorage.setItem(`rom_library_id_${counter}`, id.toString());
  }
  let updatedCounter: any;
  let maxCounter: any = localStorage.getItem("rom_library_counter_max");
  maxCounter = parseInt(maxCounter);
  if (counter == maxCounter) {
    updatedCounter = 1;
  } else {
    updatedCounter = parseInt(counter);
    updatedCounter = updatedCounter + 1;
  }
  console.log(updatedCounter);
  console.log(updatedCounter.toString());
  localStorage.setItem("rom_library_counter", updatedCounter.toString());
  console.log({ id });
  return id;
};

function getLaunchOptions(app: App) {
  let launchOptions: string[] = app.exec.split(" ");
  launchOptions.shift();
  return launchOptions.join(" ");
}

function getTarget(app: App) {
  let target: string[] = app.exec.split(" ");
  return target[0];
}

export function getCurrentUserId(useU64 = false): string {
  if (useU64) return window.App.m_CurrentUser.strSteamID;
  return BigInt.asUintN(32, BigInt(window.App.m_CurrentUser.strSteamID)).toString();
}

export async function launchApp(sAPI: ServerAPI, app: App, system: string, platform: string) {
  console.log({ app, system, platform });
  let id: number = await getShortcutID(sAPI, system);
  let appNameBeauty = app.name;
  appNameBeauty = appNameBeauty.replace(/_/g, " ");
  SteamClient.Apps.SetShortcutName(id, `${appNameBeauty} - Retro Library`);
  SteamClient.Apps.SetShortcutLaunchOptions(id, getLaunchOptions(app));
  SteamClient.Apps.SetShortcutExe(id, `"${getTarget(app)}"`);
  SteamClient.Apps.SpecifyCompatTool(id, app.compatTool === undefined ? "" : app.compatTool);

  await setTimeout(() => null, 500);
  let gid = lengthenAppId(id.toString());
  console.warn(`${app.name}`);
  console.log(`addGameListsArtwork ${app.name} ${id} ${platform}`);
  await sAPI
    .callPluginMethod("emudeck", {
      command: `addGameListsArtwork ${app.name} ${id} ${platform}`,
    })
    .then((response: any) => {
      //Refresh picture
      SteamClient.Apps.SetCustomArtworkForApp(id, "", "", 0);
    });

  SteamClient.Apps.RunGame(gid, "", -1, 100);
  SteamClient.GameSessions.RegisterForAppLifetimeNotifications((data: LifetimeNotification) => {
    if (data.unAppID == id && !data.bRunning) {
      //SteamClient.Apps.RemoveShortcut(id);
    }
  });
}

// END QL

import { definePlugin, ServerAPI, useParams } from "decky-frontend-lib";
import {
  routePath,
  routePathArtwork,
  routePathGames,
  routePathGameDetail,
  routeStore,
  routeStoreGames,
  routeStoreDetail,
} from "./init";
import { PluginIcon } from "./native-components/PluginIcon";
import { patchMenu } from "./menuPatch";
import Settings from "components/Settings";
import { Artwork } from "components/common/Artwork";
import { GameGrid } from "components/common/GameGrid";
import { GameGridLogo } from "components/common/GameGridLogo";
import { GameGridLogoStore } from "components/common/GameGridLogoStore";
import { GameDetail } from "components/common/GameDetail";
import { GameDetailStore } from "components/common/GameDetailStore";
import { SteamyHome } from "./themes/steamy/SteamyHome";
import { RetryHome } from "./themes/retry/RetryHome";
import { StoreHome } from "./themes/steamy/StoreHome";
import defaultSettings from "defaults.js";
// Función para obtener configuraciones del localStorage de forma segura
const getSettingsFromStorage = (): { vertical: boolean; logo_grid: boolean; theme: boolean } => {
  try {
    const settingsStorage = localStorage.getItem("rom_library_settings");
    return settingsStorage ? JSON.parse(settingsStorage) : defaultSettings;
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return defaultSettings; // Valores predeterminados
  }
};

export default definePlugin((serverApi: ServerAPI) => {
  const settings = getSettingsFromStorage();
  serverApi.routerHook.addRoute(routePath, () => {
    const updatedSettings = getSettingsFromStorage(); // Obtener valores actuales
    if (updatedSettings.theme === true) {
      return <RetryHome version={updatedSettings.vertical ? "vertical" : "grid"} serverAPI={serverApi} />;
    } else {
      return <SteamyHome version={updatedSettings.vertical ? "vertical" : "grid"} serverAPI={serverApi} />;
    }
    // return <SteamyHome version={updatedSettings.vertical ? "vertical" : "grid"} serverAPI={serverApi} />;
  });

  serverApi.routerHook.addRoute(routePathArtwork, () => {
    return <Artwork serverAPI={serverApi} />;
  });

  serverApi.routerHook.addRoute(`${routePathGames}/:platform/`, () => {
    const updatedSettings = getSettingsFromStorage(); // Obtener valores actuales
    const { platform } = useParams<{ platform: string }>();

    return updatedSettings.logo_grid ? (
      <GameGridLogo retro={updatedSettings.theme} serverAPI={serverApi} platform={platform} />
    ) : (
      <GameGrid retro={updatedSettings.theme} serverAPI={serverApi} platform={platform} />
    );
  });

  serverApi.routerHook.addRoute(`${routePathGameDetail}/:game_name_platform`, () => {
    const { game_name_platform } = useParams<{ game_name_platform: string }>();
    return <GameDetail serverAPI={serverApi} game_name_platform={game_name_platform} />;
  });

  //Store
  serverApi.routerHook.addRoute(routeStore, () => {
    const updatedSettings = getSettingsFromStorage(); // Obtener valores actuales
    return <StoreHome version={updatedSettings.vertical ? "vertical" : "grid"} serverAPI={serverApi} />;
  });

  serverApi.routerHook.addRoute(`${routeStoreGames}/:platform/`, () => {
    const { platform } = useParams<{ platform: string }>();
    return <GameGridLogoStore retro={false} serverAPI={serverApi} platform={platform} />;
  });

  serverApi.routerHook.addRoute(`${routeStoreDetail}/:game_name_platform`, () => {
    const { game_name_platform } = useParams<{ game_name_platform: string }>();
    return <GameDetailStore serverAPI={serverApi} game_name_platform={game_name_platform} />;
  });

  const unpatchMenu = patchMenu();

  return {
    title: <div>EmuDeck</div>,
    content: <Settings serverAPI={serverApi} />,
    icon: <PluginIcon size="1em" />,
    onDismount() {
      try {
        serverApi.routerHook.removeRoute(routePath);
        serverApi.routerHook.removeRoute(routePathArtwork);
        unpatchMenu();
      } catch (e) {
        console.error("Error during onDismount:", e);
      }
    },
  };
});

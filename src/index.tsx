import { definePlugin, ServerAPI, useParams } from "decky-frontend-lib";
import { routePath, routePathArtwork, routePathGames, routePathGameDetail } from "./init";
import { PluginIcon } from "./native-components/PluginIcon";
import { patchMenu } from "./menuPatch";
import Settings from "./components/Settings";
import { Artwork } from "./components/common/Artwork";
import { GameGrid } from "./components/common/GameGrid";
import { GameGridLogo } from "./components/common/GameGridLogo";
import { GameDetail } from "./components/common/GameDetail";
import { CategoriesHome } from "./components/categories/CategoriesHome";

// Función para obtener configuraciones del localStorage de forma segura
const getSettingsFromStorage = (): { vertical: boolean; logo_grid: boolean } => {
  try {
    const settingsStorage = localStorage.getItem("rom_library_settings");
    return settingsStorage ? JSON.parse(settingsStorage) : { vertical: false, logo_grid: false };
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return { vertical: false, logo_grid: false }; // Valores predeterminados
  }
};

export default definePlugin((serverApi: ServerAPI) => {
  const settings = getSettingsFromStorage();

  serverApi.routerHook.addRoute(routePath, () => {
    const updatedSettings = getSettingsFromStorage(); // Obtener valores actuales
    return <CategoriesHome version={updatedSettings.vertical ? "vertical" : "grid"} serverAPI={serverApi} />;
  });

  serverApi.routerHook.addRoute(routePathArtwork, () => {
    return <Artwork serverAPI={serverApi} />;
  });

  serverApi.routerHook.addRoute(`${routePathGames}/:platform`, () => {
    const updatedSettings = getSettingsFromStorage(); // Obtener valores actuales
    const { platform } = useParams<{ platform: string }>();

    console.log({ logo_grid: updatedSettings.logo_grid });
    switch (updatedSettings.logo_grid) {
      case true:
        return <GameGridLogo serverAPI={serverApi} platform={platform} />;
      case false:
        return <GameGrid serverAPI={serverApi} platform={platform} />;
      default:
        return <GameGrid serverAPI={serverApi} platform={platform} />;
    }
  });

  serverApi.routerHook.addRoute(`${routePathGameDetail}/:game_name_platform`, () => {
    const { game_name_platform } = useParams<{ game_name_platform: string }>();
    return <GameDetail serverAPI={serverApi} game_name_platform={game_name_platform} />;
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

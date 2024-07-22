import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib";
import { routePath, SP_Window, routePathArtwork } from "./init";
//import { QAMContent } from "./components/QAMContent";
import { PluginIcon } from "./native-components/PluginIcon";
import { Games } from "./components/Games";
import { Artwork } from "./components/Artwork";
import { patchMenu } from "./menuPatch";
//import { appendStyles } from "./styling";
//import { TabbedBrowser } from "./components/TabbedBrowser";
//import { tabManager } from "./classes/TabManager";
// import { settingsManager } from "./classes/SettingsManager";
// import { favoritesManager } from "./classes/FavoritesManager";
// import { patchSearchBar, unpatchSearchBar } from "./searchBarPatch";
// import { backendService } from "./classes/BackendService";

export default definePlugin((serverApi: ServerAPI) => {
  // backendService.init(serverApi);
  // settingsManager.init();
  // favoritesManager.init();
  // appendStyles(SP_Window);
  serverApi.routerHook.addRoute(routePath, () => {
    return <Games serverAPI={serverApi} />;
  });
  serverApi.routerHook.addRoute(routePathArtwork, () => {
    return <Artwork serverAPI={serverApi} />;
  });
  const unpatchMenu = patchMenu();
  // patchSearchBar();
  // const unregisterOnResume = SteamClient.System.RegisterForOnResumeFromSuspend(patchSearchBar).unregister;

  return {
    title: <div>EmuDeck</div>,
    content: <div />,
    icon: <PluginIcon size="1em" />,
    onDismount() {
      serverApi.routerHook.removeRoute(routePath);
      serverApi.routerHook.removeRoute(routePathArtwork);
      unpatchMenu();
      //unpatchSearchBar?.();
      //unregisterOnResume();
    },
  };
});

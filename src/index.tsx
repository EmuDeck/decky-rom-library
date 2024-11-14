import { definePlugin, ServerAPI, staticClasses } from "decky-frontend-lib";
import { routePath, SP_Window, routePathArtwork } from "./init";
import { PluginIcon } from "./native-components/PluginIcon";
import { patchMenu } from "./menuPatch";
import Settings from "./components/Settings";
import { Artwork } from "./components/common/Artwork";

//Tabs theme
import { TabsHome } from "./components/tabs/TabsHome";

//Tabs theme
import { CategoriesHome } from "./components/categories/CategoriesHome";

export default definePlugin((serverApi: ServerAPI) => {
  const theme: string = "tabs";

  serverApi.routerHook.addRoute(routePath, () => {
    switch (theme) {
      case "tabs":
        return <TabsHome serverAPI={serverApi} />;
      case "categories":
        return <CategoriesHome serverAPI={serverApi} />;
      default:
        return <TabsHome serverAPI={serverApi} />;
    }
  });
  serverApi.routerHook.addRoute(routePathArtwork, () => {
    return <Artwork serverAPI={serverApi} />;
  });
  const unpatchMenu = patchMenu();
  return {
    title: <div>EmuDeck</div>,
    content: <Settings serverAPI={serverApi} />,
    icon: <PluginIcon size="1em" />,
    onDismount() {
      serverApi.routerHook.removeRoute(routePath);
      serverApi.routerHook.removeRoute(routePathArtwork);
      unpatchMenu();
    },
  };
});

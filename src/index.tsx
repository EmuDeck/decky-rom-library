import { definePlugin, ServerAPI, useParams } from "decky-frontend-lib";
import { routePath, routePathArtwork, routePathGames, routePathGameDetail } from "./init";
import { PluginIcon } from "./native-components/PluginIcon";
import { patchMenu } from "./menuPatch";
import Settings from "./components/Settings";
import { Artwork } from "./components/common/Artwork";
import { GameGrid } from "./components/common/GameGrid";
import { GameDetail } from "./components/common/GameDetail";
//Tabs theme
import { TabsHome } from "./components/tabs/TabsHome";

//Cats theme
import { CategoriesHome } from "./components/categories/CategoriesHome";

export default definePlugin((serverApi: ServerAPI) => {
  const theme: string = "categories";

  serverApi.routerHook.addRoute(routePath, () => {
    switch (theme) {
      case "tabs":
        return <TabsHome serverAPI={serverApi} />;
      case "categories":
        return <CategoriesHome version="grid" serverAPI={serverApi} />;
      case "categories-vertical":
        return <CategoriesHome version="vertical" serverAPI={serverApi} />;
      default:
        return <TabsHome serverAPI={serverApi} />;
    }
  });
  serverApi.routerHook.addRoute(routePathArtwork, () => {
    return <Artwork serverAPI={serverApi} />;
  });
  serverApi.routerHook.addRoute(`${routePathGames}/:platform`, () => {
    const { platform } = useParams<{ platform: string }>();
    return <GameGrid serverAPI={serverApi} platform={platform} />;
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
      serverApi.routerHook.removeRoute(routePath);
      serverApi.routerHook.removeRoute(routePathArtwork);
      unpatchMenu();
    },
  };
});

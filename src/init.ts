import { Router, getReactRoot } from "decky-frontend-lib";
// import { name } from '../plugin.json'

export const pluginName = "EmuDeck Retro Library";
export const routePath = "/emudeck-rom-library";
export const routePathArtwork = "/emudeck-rom-artwork";
export const routePathGames = "/emudeck-rom-games";
export const routePathGameDetail = "/emudeck-rom-detail";

export const defaultUrl = "https://store.steampowered.com";

export const windowRouter = Router.WindowStore?.GamepadUIMainWindowInstance;
export const SP_Window = windowRouter?.BrowserWindow;
export const reactTree = getReactRoot(document.getElementById("root") as any);

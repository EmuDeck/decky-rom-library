import { Router, getReactRoot } from "decky-frontend-lib";
// import { name } from '../plugin.json'

export const pluginName = "EmuDeck Rom Launcher";
export const routePath = "/emudeck-rom-launcher";
export const defaultUrl = "https://store.steampowered.com";

export const windowRouter = Router.WindowStore?.GamepadUIMainWindowInstance;
export const SP_Window = windowRouter?.BrowserWindow;
export const reactTree = getReactRoot(document.getElementById("root") as any);

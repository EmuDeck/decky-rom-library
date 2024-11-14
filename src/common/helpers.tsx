export const getDataGames = async (serverAPI, setState, state) => {
  console.log("Asking for Games");
  await serverAPI.callPluginMethod("emudeck", { command: `generateGameLists` });
  serverAPI.callPluginMethod("emudeck", { command: `generateGameListsJson` }).then((response: any) => {
    const result: any = response.result;
    const gameList: any = JSON.parse(result);
    console.log({ result });
    gameList.sort((a: any, b: any) => a.title.localeCompare(b.title));
    console.log("Saving Games to State");
    console.log({ gameList });
    setState({ ...state, games: gameList });
  });
};

export const getDataSettings = async (serverAPI, setState, state) => {
  console.log("Asking for Settings");
  await serverAPI.callPluginMethod("getSettings", {}).then((response: any) => {
    const result: any = response.result;
    const emuDeckConfig: any = JSON.parse(result);
    console.log({ result });
    console.log("Saving Settings to State");
    setState({ ...state, emuDeckConfig });
  });
};

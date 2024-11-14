import { VFC, useState, useEffect } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField } from "decky-frontend-lib";
import { launchApp } from "../../common/steamshortcuts";
import { getTranslateFunc } from "../../TranslationsF";
import { Category } from "../common/Category";

const CategoriesHome: VFC<{ serverAPI: any }> = ({ serverAPI }) => {
  const styles = `

  .container{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding-top: 58px;
    padding-bottom: 40px;
    padding-left: 2.8vw;
    padding-right: 2.8vw;
    scroll-padding-top: 116px;
    scroll-padding-bottom: 80px;
  }

  .container--scroll{
    overflow:scroll;
  }

  .categories{
        display:grid;
        grid-template-columns: repeat(auto-fill, 185px);
        grid-auto-rows: 185px;
        gap: 22px;
        font-size: 16.8182px;
        padding-left: 0px;
        padding-right: 0px;
    }
  }

  .category{
    //position:relative;
    //width: calc(20% - 15px);
    // transition: .5s;
    border:0px;
    padding:0;
    line-height:0;
    // max-height:218px;
    overflow: visible;
    border: none;
    box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, .25);
    filter: brightness(0.9);
    transition: filter, box-shadow, transform .1s cubic-bezier(0.16, 0.86, 0.43, 0.99);
    outline: none;
    box-sizing: content-box;
    width: 100%;
    height: 100%;
    margin: 0;
    position: relative;
    cursor: pointer;
    transform-origin: 50% 50%;
    transform-style: preserve-3d;
    transform: scale(0.98);
    background: transparent
  }

  .category.gpfocus, .category:hover{
    transition-duration: .05s;
    transition-timing-function: ease-out;
    filter: brightness(0.8) contrast(1.05) saturate(1);
    transform: scale(1.08)
  }

  `;

  //
  // State
  //
  const [state, setState] = useState<any>({
    games: undefined,
    emuDeckConfig: {
      systemOS: "",
    },
  });

  let { games, emuDeckConfig } = state;
  const { systemOS } = emuDeckConfig;
  //
  // Const & Vars
  //
  const t = getTranslateFunc();
  let intervalid: any;
  //
  // Functions
  //

  const getDataGames = async () => {
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

  const getDataSettings = async () => {
    console.log("Asking for Settings");
    await serverAPI.callPluginMethod("getSettings", {}).then((response: any) => {
      const result: any = response.result;
      const emuDeckConfig: any = JSON.parse(result);
      console.log({ result });
      console.log("Saving Settings to State");
      setState({ ...state, emuDeckConfig });
    });
  };

  //
  // UseEffects
  //

  useEffect(() => {
    getDataSettings();
  }, []);

  useEffect(() => {
    if (emuDeckConfig.systemOS !== "") {
      console.log("getDataGames launched");
      getDataGames();
    }
  }, [emuDeckConfig]);
  //
  // Render
  //

  return (
    <div className="container container--scroll">
      <style>{` ${styles} `}</style>
      {!games && (
        <div style={{ textAlign: "center", height: "100vh" }}>
          <SteamSpinner>
            <p>{t("loadingGames")}</p>
          </SteamSpinner>
        </div>
      )}
      {games && (
        <Focusable className={`categories CSSGrid Grid Panel`}>
          {games.map((platform: any) => {
            return <Category platform={platform} />;
          })}
        </Focusable>
      )}
    </div>
  );
};

export { CategoriesHome };

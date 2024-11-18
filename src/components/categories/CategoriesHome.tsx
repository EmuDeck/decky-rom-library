import { VFC, useState, useEffect } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField, useParams } from "decky-frontend-lib";
import { routePathGames } from "init";
import { getTranslateFunc } from "TranslationsF";
import { Category } from "components/common/Category";
import { getDataGames, getDataSettings } from "common/helpers";
const CategoriesHome: VFC<{ serverAPI: any; version: string }> = ({ serverAPI, version }) => {
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

  h1 small{
    font-size:12px;
    display:block
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

  /* Full size cats */
  .vertical.categories{
    grid-template-columns: repeat(auto-fill, 25vw);
    grid-auto-rows: calc(100vh - 114px);
    height: 100vh;
    width: 10000px;
    overflow: scroll;
  }

  .vertical.categories .category ._3n796D6GS1fdlXhRnRUfRv{
    display:none !important
  }

  .category{
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

  const [percentage, setPercentage] = useState("...");

  //
  // Const & Vars
  //
  const t = getTranslateFunc();
  let intervalid: any;
  //
  // Functions
  //
  const checkParserStatus = () => {
    //console.log("checkCloudStatus");
    serverAPI
      .callPluginMethod("emudeck", { command: "generateGameLists_getPercentage" })
      .then((response: any) => {
        const result = response.result;
        setPercentage(result);
        if (result == "100") {
          clearInterval(intervalid);
        }
      })
      .catch((error: any) => {
        console.log({ error });
      });
  };
  //
  // UseEffects
  //

  useEffect(() => {
    console.log("getData launched");
    getDataSettings(serverAPI, setState, state);

    intervalid = setInterval(() => {
      checkParserStatus();
    }, 5000);

    return () => {
      clearInterval(intervalid);
    };
  }, []);

  useEffect(() => {
    if (emuDeckConfig.systemOS !== "") {
      console.log("getDataGames launched");
      const gamesLS = sessionStorage.getItem("rom_library_games");
      if (gamesLS) {
        const gamesJson: any = JSON.parse(gamesLS);
        setState({ ...state, games: gamesJson });
      } else {
        getDataGames(serverAPI, setState, state);
      }
    }
  }, [emuDeckConfig]);
  //
  // Render
  //

  return (
    <>
      <style>{` ${styles} `}</style>
      {!games && (
        <div style={{ textAlign: "center", height: "100vh" }}>
          <SteamSpinner>
            <p>{t("loadingGames")}</p>
          </SteamSpinner>
        </div>
      )}
      {games && (
        <>
          <div className="container container--scroll">
            <h1>
              EmuDeck Retro Library
              <small>Parsed: {percentage}</small>
            </h1>
            <Focusable className={`categories CSSGrid Grid Panel ${version}`}>
              {games.map((platform: any) => {
                return (
                  <Category
                    platform={platform}
                    onClick={() => {
                      Router.Navigate(`${routePathGames}/${platform.id}`);
                    }}
                  />
                );
              })}
            </Focusable>
          </div>
        </>
      )}
    </>
  );
};

export { CategoriesHome };

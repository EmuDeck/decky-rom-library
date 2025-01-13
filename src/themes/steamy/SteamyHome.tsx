import { VFC, useState, useEffect } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField, useParams } from "decky-frontend-lib";
import { routePathGames } from "init";
import { getTranslateFunc } from "TranslationsF";
import { Category } from "components/common/Category";
import { getDataGames, getDataSettings, checkParserStatus, checkStatus } from "common/helpers";
const SteamyHome: VFC<{ serverAPI: any; version: string }> = ({ serverAPI, version }) => {
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
    scroll-padding-left: 22px;
    scroll-padding-right: 22px;
    scroll-behavior: smooth
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
        padding-bottom: 30px;
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

  ._3IWn-2rn7x98o5fDd0rAxb{
    overflow: visible
  }

  ._3IWn-2rn7x98o5fDd0rAxb:after{
    width: 106%;
    height: 106%;
    top: -3%;
    left: -3%;
    background: #fff;
    mix-blend-mode: color-dodge;
  }

  ._1sTuvqUAeproqHEae5sn9z{
    position: absolute;
    pointer-events: none;
    outline-offset: 2px;
    outline: 2px solid rgba(255,255,255,.6);
    animation: _15zi-K8KeANNjTmN-l_gGO .5s ease,_3vSPb8XtrL-SLJHu3FMU0_ .4s ease,xL-jG-fV4Nsl-PqweE0Ry .4s ease,_3mURostQ1qQKI2o_ZECEzW 1.2s ease-in-out .4s 20;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;

  }

  .BasicUI ._3IWn-2rn7x98o5fDd0rAxb.gpfocus::after{
    display:none;
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
  const [lastSelectedGameKey, setLastSelectedGameKey] = useState<string | null>(null);

  let { games, emuDeckConfig } = state;
  const { systemOS } = emuDeckConfig;

  const [percentage, setPercentage] = useState("Loading...");
  const [msg, setMsg] = useState("Loading...");

  //
  // Const & Vars
  //
  const t = getTranslateFunc();
  let intervalid: any;
  //
  // Functions
  //

  const handleFocus = (platform: any, gameKey: any) => {
    console.log("Setting focus on:", gameKey);
    setLastSelectedGameKey(gameKey);
    localStorage.setItem("last_selected_category", gameKey);
  };

  const isFocused = (gameKey: string) => lastSelectedGameKey === gameKey;

  //
  // UseEffects
  //

  useEffect(() => {
    //console.log("getData launched");
    getDataSettings(serverAPI, setState, state);

    //     intervalid = setInterval(() => {
    //       checkParserStatus(serverAPI, setPercentage, intervalid);
    //     }, 5000);
    //
    //     return () => {
    //       clearInterval(intervalid);
    //     };
  }, []);

  useEffect(() => {
    const readLastCategory = () => {
      const categoryLast = localStorage.getItem("last_selected_category");
      if (categoryLast) {
        setLastSelectedGameKey(categoryLast);
        console.log("Read from localStorage:", categoryLast);
      }
      console.log({ lastSelectedGameKey });
    };

    readLastCategory();

    // Agregar el listener para el evento popstate
    window.addEventListener("popstate", readLastCategory);

    return () => {
      window.removeEventListener("popstate", readLastCategory);
    };
  }, []);

  useEffect(() => {
    //console.log("getData launched");
    intervalid = setInterval(() => {
      checkStatus(serverAPI, setMsg, intervalid);
      checkParserStatus(serverAPI, setPercentage, intervalid);
    }, 500);

    return () => {
      clearInterval(intervalid);
    };
  }, []);

  useEffect(() => {
    console.log({ msg });
  }, [msg]);
  useEffect(() => {
    console.log({ percentage });
  }, [percentage]);

  useEffect(() => {
    if (emuDeckConfig.systemOS !== "") {
      //console.log("getDataGames launched");
      const gamesLS = sessionStorage.getItem("rom_library_games");
      if (gamesLS) {
        const gamesJson: any = JSON.parse(gamesLS);
        setState({ ...state, games: gamesJson });
        //getArtwork(serverAPI);
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
            <p>{msg}</p>
          </SteamSpinner>
        </div>
      )}
      {games && (
        <>
          <div className="container container--scroll">
            {version == "grid" && (
              <h1>
                EmuDeck Retro Library
                <small>Parser: {percentage}</small>
              </h1>
            )}
            <Focusable
              className={`categories CSSGrid Grid Panel ${version}`}
              style={{
                width: version === "vertical" ? `${games.length * 28}vw` : "auto",
              }}>
              {games.map((platform: any, index: number = 0) => {
                index = index + 1;
                const gameKey = `${platform.name}_${platform.id}`;
                console.log("Checking focus:", { gameKey, lastSelectedGameKey });
                return (
                  <Category
                    focus={isFocused(gameKey)}
                    key={platform.id}
                    showGrid={true}
                    platform={platform}
                    handleFocus={() => handleFocus(platform, gameKey)}
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

export { SteamyHome };

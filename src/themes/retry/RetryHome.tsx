import { VFC, useState, useEffect } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField, useParams } from "decky-frontend-lib";
import { routePathGames, routeStore } from "init";
import { getTranslateFunc } from "TranslationsF";
import { Category } from "components/common/Category";
import { getDataGames, getDataSettings, checkParserStatus } from "common/helpers";
const RetryHome: VFC<{ serverAPI: any; version: string }> = ({ serverAPI, version }) => {
  const styles = `

  .grid.categories{
    grid-template-columns: repeat(auto-fill, 15vw);
    grid-auto-rows: calc(46vh - 118px);
    overflow: scroll;
    padding: 20px 25px
  }

  .grid.categories .category ._3n796D6GS1fdlXhRnRUfRv{
    display:none !important
  }

  .container{
    position: absolute;
    top: auto;
    right: 0;
    bottom: 22px;
    left: 0;
    padding-bottom: 40px;
    padding-right: 2.8vw;
    scroll-padding-top: 166px;
    scroll-padding-bottom: 80px;
    scroll-padding-right: 75vw;
    scroll-padding-left: 25vw;
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

  .galery-img{
    width:100%;
    object-fit:cover
  }



  .galeries-bg{
    width:100%;
    position:absolute;
    left:0;
    top:0;
    z-index:0;
    height:100vh
  }

  .BasicUI ._3IWn-2rn7x98o5fDd0rAxb{
    opacity:0.8;
    transition: .8s;
    border-radius:6px;
    outline: 4px solid transparent;
    outline-color: transparent;
  }

  .BasicUI ._3IWn-2rn7x98o5fDd0rAxb:focus{
    opacity: 1;
    transform: scale(1.2);
    outline: 4px solid #8acaf1;
    outline-color:  #8acaf1;
    transition: .8s;
    border-radius:0
  }

  .BasicUI ._3IWn-2rn7x98o5fDd0rAxb:nth-child(n+6).transform:focus{
    transform-origin: 150%
  }

  .BasicUI ._3IWn-2rn7x98o5fDd0rAxb > ._2ERAQD94mxjbyV0G5P9ic5{
      border-radius:6px
  }

  .categories-bg{
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
      position:absolute;
      height:calc(100% - 38px);
      top:38px
  }

 .fade-in {
   animation: fadeIn 1s ease-in-out forwards; /* Aplica la animación */
 }

 @keyframes fadeIn {
   from {
     opacity: 0;
   }
   to {
     opacity: 1;
   }
 }

 .fade-out {
    animation: fadeOut 0.5s ease-in-out forwards; /* Aplica la animación */
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }


  /* Full size cats */



  .vertical.container{
    top: 40px;
    scroll-padding-top: 0;
    scroll-padding-bottom: 0;
    scroll-padding-right: 40vw;
    scroll-padding-left: 40vw;
    scroll-behavior: unset;
  }





  .vertical.categories{
    grid-template-columns: repeat(auto-fill, 25vw);
    grid-auto-rows: calc(100vh - 82px);
    height: 100vh;
    overflow: scroll;
    gap:0;
  }

  .vertical.categories .category ._3n796D6GS1fdlXhRnRUfRv{
    display:none !important
  }

  .vertical .galery-img{
    height: 100%;
  }

  .BasicUI .vertical ._3IWn-2rn7x98o5fDd0rAxb{
    border-radius:0px;
    mix-blend-mode: luminosity;
  }

  .BasicUI .vertical ._3IWn-2rn7x98o5fDd0rAxb:focus{
    z-index: 99;
    outline: none;
    mix-blend-mode: normal;
    width: 100vw;
    margin-left: -150%;
  }

  .BasicUI .vertical ._3IWn-2rn7x98o5fDd0rAxb:focus{
    z-index: 99;
    outline: none;
    mix-blend-mode: normal;
    width: 100vw;
    margin-left: -150%;
  }

  .BasicUI .vertical ._3IWn-2rn7x98o5fDd0rAxb:first-child:focus{
    margin-left: 0%;
  }


  .BasicUI .vertical ._3IWn-2rn7x98o5fDd0rAxb:nth-child(2):focus{
    margin-left: -100%;
  }

  .BasicUI .vertical ._3IWn-2rn7x98o5fDd0rAxb > ._2ERAQD94mxjbyV0G5P9ic5{
      border-radius:0px
  }

  .categories-logo{
    position: absolute;
    height: 35%;
    width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    text-align: center;
    pointer-events: none;
    z-index: 999;
    background: rgba(255, 255, 255, .2);
    backdrop-filter: blur(5px);
  }

  .categories-logo img{
    position: absolute;
    height: 200%;
    width: auto;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
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
    platformCurrent: undefined,
    platformPrev: undefined,
  });
  const [lastSelectedGameKey, setLastSelectedGameKey] = useState<any | null>(null);

  const [visible, setVisible] = useState(false);

  let { games, emuDeckConfig, platformCurrent, platformPrev } = state;
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

  const handleFocus = (platform: any, gameKey: any) => {
    const platformPrevious = platformCurrent;
    setState({ ...state, platformCurrent: platform.id, platformPrev: platformPrevious });
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

    intervalid = setInterval(() => {
      checkParserStatus(serverAPI, setPercentage, intervalid);
    }, 5000);

    return () => {
      clearInterval(intervalid);
    };
  }, []);

  useEffect(() => {
    const readLastCategory = () => {
      const categoryLast = localStorage.getItem("last_selected_category");
      if (categoryLast) {
        setLastSelectedGameKey(categoryLast);
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

  useEffect(() => {
    if (games) {
      const firstID = games[0].id;
      setState({ ...state, platformCurrent: firstID, platformPrev: firstID });
    }
  }, [games]);

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
          {version !== "vertical" && (
            <img
              className={`categories-bg fade-in`}
              src={`/customimages/retrolibrary/assets/default/backgrounds/${platformCurrent}.jpg`}
            />
          )}
          {version === "vertical" && (
            <div className="categories-logo fade-in">
              <img src={`/customimages/retrolibrary/assets/default/logos/${platformCurrent}.png`} />
            </div>
          )}
          <div className={`container container--scroll ${version}`}>
            <Focusable
              className={`categories CSSGrid Grid Panel ${version}`}
              style={{ width: `${games.length * 28}vw` }}>
              <Category
                version=""
                focus={isFocused("emulators")}
                handleFocus={() => handleFocus({ title: "EmuDeck Store", id: "store", games: [] }, "store")}
                key="emulators"
                showGrid={false}
                platform={{ title: "EmuDeck Store", id: "store", games: [] }}
                onClick={() => {
                  Router.Navigate(`${routeStore}`);
                }}
              />

              {games.map((platform: any, index: number = 0) => {
                index = index + 1;
                const gameKey = `${platform.name}_${platform.id}`;
                return (
                  <Category
                    focus={isFocused(gameKey)}
                    version={version}
                    key={platform.id}
                    showGrid={false}
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

export { RetryHome };

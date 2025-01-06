import { VFC, useState, useEffect } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField, useParams } from "decky-frontend-lib";
import { routePathGames } from "init";
import { getTranslateFunc } from "TranslationsF";
import { Category } from "components/common/Category";
import { getDataGames, getDataSettings, checkParserStatus, getArtwork } from "common/helpers";
const RetryHome: VFC<{ serverAPI: any; version: string }> = ({ serverAPI, version }) => {
  const styles = `

  .container{
    position: absolute;
    top: auto;
    right: 0;
    bottom: 22px;
    left: 0;
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
    grid-template-columns: repeat(auto-fill, 15vw);
    grid-auto-rows: calc(46vh - 118px);
    overflow: scroll;
    padding: 20px 25px
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
    opacity:0.6;
    transition: .5s;
    border: 4px solid transparent;
  }
  .BasicUI ._3IWn-2rn7x98o5fDd0rAxb:focus{
    opacity: 1;
    transform: scale(1.2);
    border: 4px solid #8acaf1;
    transition: .5s
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
  });

  let { games, emuDeckConfig, platformCurrent } = state;
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

  const handleFocus = (platform: any) => {
    console.log({ platform });
    setState({ ...state, platformCurrent: platform.id });
  };

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
          <img className="galeries-bg" src={`/customimages/retrolibrary/systems/backgrounds/${platformCurrent}.jpg`} />
          <div className="container container--scroll">
            {version == "grid" && (
              <h1>
                EmuDeck Retro Library
                <small>Parsed: {percentage}</small>
              </h1>
            )}

            <Focusable className={`categories CSSGrid Grid Panel ${version}`} style={{width: `${games.length*28}vw`}}>

              {games.map((platform: any) => {
                return (
                  <Category
                    showGrid={false}
                    platform={platform}
                    handleFocus={() => handleFocus(platform)}
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

import { VFC, useState, useEffect, useRef } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField } from "decky-frontend-lib";
import { launchApp } from "common/steamshortcuts";
import { getTranslateFunc } from "TranslationsF";
import { Game } from "components/common/Game";
import { getDataSettings } from "common/helpers";
import { useFetchCond } from "hooks/useFetchCond";

const GameDetailStore: VFC<{ serverAPI: any; game_name_platform: any }> = ({ serverAPI, game_name_platform = "" }) => {
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

  .list{
    list-style:none;
    padding-left:0;
    margin:0;
  }
  .list li{
    padding-left:0
  }

  .game-detail{
    position:relative;
    overflow:hidden
  }

  .game-detail__blur{
    position:absolute;
    pointer-events:none;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    filter: blur(100px);
    z-index:0
  }
  .game-detail__hero{
    height: 190px;
    overflow: hidden;
    position: relative;
    margin-top: 50px;
    display: flex;
    padding: 10px 20px;
  }

  .game-detail__img{
    object-fit:cover;
    position:absolute;
    top:0;
    left:0;
    width:100%
  }

  .game-detail__logo{
    position:static;
    height: 180px;
    margin-right:20px;
  }

  .game-detail-data{
    padding: 18px 28px;
    background: rgba(14,20,27,.25);
    font-family: "Motiva Sans", Helvetica, sans-serif;
    position:relative;
    z-index:1;
    padding-bottom:100px;
    height: calc(100vh);
  }

  .game-detail__info{
    display: flex;
    flex-flow: row;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    font-size: 16px;
    font-style: normal;
    line-height: 20px;
    text-align: left;
    text-decoration: none;
    text-indent: 0;
    text-shadow: none;
    text-transform: none;
    letter-spacing: 0px;
    color: #fff;
    font-weight: 500;
    margin-bottom:24px
  }

  .game-detail__info span,
  .game-detail__achievements__locked-title{
    display:block;
    text-transform:uppercase;
    font-weight: bold;
    font-size: 12px;
    line-height: 22px;
    letter-spacing: .5px;
    color: rgba(255, 255, 255, .7);
  }

  .game-detail__play-btn{
    background: rgba(255,255,255,.2) !important;

  }
  .game-detail__play-btn:focus{
    background:  #59bf40 !important

  }



  .game-detail__cloud{
    display: flex;
    justify-content: center;

    font-size: 16px;
    font-style: normal;
    line-height: 20px;
    text-align: left;
    text-decoration: none;
    text-indent: 0;
    text-shadow: none;
    text-transform: none;
    letter-spacing: 0px;
    color: #fff;
    font-weight: 500;
    margin-bottom:12px;
  }
  .game-detail__cloud span{
    text-transform:uppercase;
  }
  .game-detail__cloud:after,
  .game-detail__cloud:before{
    background-color: rgba(61, 68, 80, .54);
    content: "";
    display: inline-block;
    height: 2px;
    position: relative;
    vertical-align: middle;
    width: 40%;
    top:11px;
  }

  .game-detail__cloud:before{
    right: .5em;
    margin-left: -40%;
  }

  .game-detail__cloud:after{
    left: .5em;
    margin-right: -40%;
  }

  .game-detail__achievements{
    background: rgba(103, 112, 123, .2);
  }

  .game-detail__achievements__progress{
    padding: 10px;
    font-size: 16px;
    color: #ccc;
    position: relative;
    margin-bottom: 8px;
    border-radius: 0px;
    box-shadow: none;
    background: #23262e;
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }

  .game-detail__achievements__inner{
    padding: 20px 12px
  }

  .game-detail__achievements__unlocked{
    display:flex;
    gap:8px;
  }

  .game-detail__achievements__unlocked img{
    width: 74px;
  }

  .game-detail__achievements__locked-title{
    margin-top:16px;
    margin-bottom:10px;
  }

  .game-detail__achievements__locked{
    display:flex;
    gap:8px;
  }
  .game-detail__achievements__locked img{
    width: 52px;
  }

  .game-detail__more_info{
    display:flex;
    gap:24px;
    font-size: 14px;
  }

  .game-detail__more_info-data{
    display:block;
  }

  .game-detail__more_info-img img{ width: 150px }


 .game-detail__more_info span {
   color: #808486;
   line-height: 16px;
  }
  .game-detail__tabs{
    /* padding-bottom:100% Tabs fix */
  }

  .game-detail__tabs .Panel{
    position:relative
  }

`;

  const buttonRef = useRef<any>(null);

  //
  // State
  //

  const [state, setState] = useState<any>({
    game: undefined,
    installing: undefined,
    emuDeckConfig: {
      systemOS: "",
    },
  });

  const [installed, setInstalled] = useState<any>(false);

  let { game, installing, emuDeckConfig } = state;
  //
  // Const & Vars
  //
  const t = getTranslateFunc();

  //
  // Functions
  //
  const installGame = (serverAPI: any, platform: string, name: string, url: string) => {
    setState({ ...state, installing: true });

    console.log(`Store_installGame ${platform} ${name} ${url}`);

    serverAPI
      .callPluginMethod("emudeck", { command: `Store_installGame "${platform}" "${name}" "${url}"` })
      .then((response: any) => {
        const result = response.result;
        setInstalled(true);
        setState({ ...state, installing: undefined });

        //We add it to the game collection
        const gamesStore: any = sessionStorage.getItem("rom_library_games");
        const gamesJson: any = JSON.parse(gamesStore);
        const filename: any = url.split("/").pop();
        const nameGame = filename.replace(/\.[^/.]+$/, "");

        const index = gamesJson.findIndex((item) => item.id === platform);

        gamesJson[index].games.push({
          name: nameGame,
          og_name: name,
          filename: `"/run/media/deck/EmuDeck/Emulation/roms/${platform}/${nameGame}.zip"`,
          file: nameGame,
          img: `/customimages/retrolibrary/artwork/${platform}/media`,
          platform: "gb",
        });

        gamesJson.sort((a: any, b: any) => a.title.localeCompare(b.title));
        const gamesString = JSON.stringify(gamesJson);
        sessionStorage.setItem("rom_library_games", gamesString);

        return result;
      })
      .catch((error: any) => {
        //console.log({ error });
      });
  };

  const uninstallGame = (serverAPI: any, platform: string, name: string, url: string) => {
    setState({ ...state, installing: true });
    serverAPI
      .callPluginMethod("emudeck", { command: `Store_uninstallGame ${platform} ${name} ${url}` })
      .then((response: any) => {
        const result = response.result;
        setInstalled(false);
        setState({ ...state, installing: undefined });

        //We remove it from the game collection
        const gamesStore: any = sessionStorage.getItem("rom_library_games");
        const gamesJson: any = JSON.parse(gamesStore);
        const filename: any = url.split("/").pop();
        const nameGame = filename.replace(/\.[^/.]+$/, "");

        const index = gamesJson.findIndex((item) => item.id === platform);
        console.log({ index });
        const platformToChange = gamesJson[index];
        console.log({ platformToChange });
        const gameIndex = platformToChange.games.findIndex((item) => item.file === nameGame);

        console.log({ gameIndex });
        gamesJson[index].splice(gameIndex, 1);
        gamesJson.sort((a: any, b: any) => a.title.localeCompare(b.title));
        const gamesString = JSON.stringify(gamesJson);
        sessionStorage.setItem("rom_library_games", gamesString);

        return result;
      })
      .catch((error: any) => {
        //console.log({ error });
      });
  };

  const checkGame = (serverAPI: any, platform: string, name: string, url: string) => {
    serverAPI
      .callPluginMethod("emudeck", { command: `Store_isGameInstalled ${platform} ${name} ${url}` })
      .then((response: any) => {
        const result = response.result;
        if (result.includes("true")) {
          setInstalled(true);
        } else {
          setInstalled(false);
        }
      })
      .catch((error: any) => {
        //console.log({ error });
      });
  };

  //
  // UseEffects
  //

  useEffect(() => {
    getDataSettings(serverAPI, setState, state);

    const timeout = setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.tabIndex = 0;
        buttonRef.current.focus?.();
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const gamesLS = sessionStorage.getItem("rom_store_games");
    if (gamesLS) {
      try {
        const partial = game_name_platform.split("|||");
        const name = partial[0];
        const platform = partial[1];
        const gamesJson: any = JSON.parse(gamesLS);
        //Get Retro Achievements data

        const filteredPlatform = gamesJson.filter((item: any) =>
          item.id?.toLowerCase().includes(platform.toLowerCase())
        );

        if (filteredPlatform.length === 0) {
          //console.error("No se encontró ninguna plataforma que coincida con", platform);
          return;
        }

        const gamesArray = filteredPlatform[0]?.games;

        if (!Array.isArray(gamesArray)) {
          //console.error("La plataforma no contiene un array de juegos");
          return;
        }

        const filteredGame = gamesArray.filter((game: any) => game.name?.toLowerCase().includes(name.toLowerCase()));
        setState({ ...state, game: filteredGame[0], launcher: filteredPlatform[0].launcher, platform: platform });
        checkGame(serverAPI, filteredGame[0].platform, filteredGame[0].name, filteredGame[0].file);
        //getDataAchievements(serverAPI, setStateAchievements, stateAchievements, platform, filteredGame[0].hash);
      } catch (error) {
        console.error("Error al parsear los juegos:", error);
      }
    }
  }, [emuDeckConfig]);
  //
  // Render
  //

  return (
    <>
      <style>{` ${styles} `}</style>
      {!game && (
        <div style={{ textAlign: "center", height: "100vh" }}>
          <SteamSpinner></SteamSpinner>
        </div>
      )}
      {game && (
        <>
          <div className="container--scroll">
            <div className="game-detail">
              <img src={`${game.pictures.screenshots[0]}`} className="game-detail__blur" />
              <div className="game-detail__hero">
                <img className="game-detail__logo" src={`${game.pictures.titlescreens[0]}`} alt={game.name} />
                <div className="game-detail__tabs">
                  {game && game.description && (
                    <>
                      <h3>Game Info</h3>
                      <div tabIndex={0} className="game-detail__more_info">
                        <div className="game-detail__more_info-data">
                          <div className="game-detail__more_info-data__top">{game.description}</div>
                        </div>
                      </div>{" "}
                    </>
                  )}
                </div>
              </div>
              <div className="game-detail-data">
                <div className="game-detail__info">
                  <div className="game-detail__info-btn _3cI5TXsFX3bvpR-7EBOtxq">
                    {installed || (
                      <Button
                        ref={buttonRef}
                        focusable={true}
                        noFocusRing={false}
                        disabled={installing}
                        className="game-detail__play-btn _3ydigb6zZAjJ0JCDgHwSYA _2AzIX5kl9k6JnxLfR5H4kX"
                        onClick={() => installGame(serverAPI, game.platform, game.name, game.file)}>
                        Install
                      </Button>
                    )}
                    {installed && (
                      <Button
                        ref={buttonRef}
                        focusable={true}
                        noFocusRing={false}
                        disabled={installing}
                        className="game-detail__play-btn _3ydigb6zZAjJ0JCDgHwSYA _2AzIX5kl9k6JnxLfR5H4kX"
                        onClick={() => uninstallGame(serverAPI, game.platform, game.name, game.file)}>
                        Uninstall
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export { GameDetailStore };

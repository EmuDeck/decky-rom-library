import { VFC, useState, useEffect } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField } from "decky-frontend-lib";
import { launchApp } from "common/steamshortcuts";
import { getTranslateFunc } from "TranslationsF";
import { Game } from "components/common/Game";
import { getDataGames, getDataSettings } from "common/helpers";
const GameDetail: VFC<{ serverAPI: any; game_name_platform: any }> = ({ serverAPI, game_name_platform = "" }) => {
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
    height:250px;
    overflow:hidden;
    position:relative;
  }

  .game-detail__img{
    object-fit:cover;
    position:absolute;
    top:0;
    left:0;
    width:100%
  }

  .game-detail__logo{
    position:absolute;
    left: 20px;
    bottom: 10px;
    width: 50%;
  }

  .game-detail-data{
    padding: 18px 28px;
    background: rgba(14,20,27,.25);
    font-family: "Motiva Sans", Helvetica, sans-serif;
    position:relative;
    z-index:1;
    padding-bottom:100px;
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
    display:flex;
    flex-direction:column;
    flex-basis: 53%;
    justify-content: space-between;
  }

  .game-detail__more_info-img img{ width: 150px }


 .game-detail__more_info span {
   color: #808486;
   line-height: 16px;
  }

`;
  //
  // State
  //

  const [state, setState] = useState<any>({
    game: undefined,
    platform: undefined,
    launcher: undefined,
    emuDeckConfig: {
      systemOS: "",
    },
  });

  const [stateAchievements, setStateAchievements] = useState<any>({
    achievements: null,
    earned: null,
    earnedHardcore: null,
    neither: null,
  });
  const [percentage, setPercentage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataState, setDataState] = useState<any>(undefined);
  const [lastSelectedGameKey, setLastSelectedGameKey] = useState<string | null>(null);

  let { game, launcher, emuDeckConfig, platform } = state;
  const { systemOS } = emuDeckConfig;

  const { achievements, earned, earnedHardcore, neither } = stateAchievements;

  //
  // Const & Vars
  //
  const t = getTranslateFunc();
  //
  // Functions
  //
  const launchGame = (launcher: string, game: string, name: string, platform: string) => {
    //console.log({ launcher, game, name, platform });
    const gameKey = `${name}_${platform}`;
    localStorage.setItem("last_selected_game_key", gameKey);

    let launcherComplete = launcher.replace(/{file.path}/g, `'${game}'`);
    if (emuDeckConfig.systemOS == "nt") {
      launcherComplete = launcherComplete
        .replace(
          "powershell -ExecutionPolicy Bypass -NoProfile -File  '",
          `C:\\Windows\\System32\\cmd.exe /k start /min "Loading PowerShell Launcher" "C:\\Windows\\System32\\WindowsPowershell\\v1.0\\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "& {`
        )
        .replace("'", "");
      launcherComplete = launcherComplete.slice(0, -1) + `'}" && exit " && exit --emudeck`;
    } else {
      launcherComplete = launcherComplete
        .replace(/\\"\'/g, "")
        .replace(/'\\\"/g, "")
        .replace(/\\\\/g, "\\")
        .replace(/\\:"/g, '"Z:');
    }
    launchApp(serverAPI, { name, exec: launcherComplete }, systemOS, platform);
  };

  function getIDByName(name) {
    switch (name) {
      case "genesis":
        return 1;
      case "n64":
        return 2;
      case "snes":
        return 3;
      case "gb":
        return 4;
      case "gba":
        return 5;
      case "gbc":
        return 6;
      case "nes":
        return 7;
      case "pcengine":
        return 8;
      case "segacd":
        return 9;
      case "sega32x":
        return 10;
      case "mastersystem":
        return 11;
      case "psx":
        return 12;
      case "lynx":
        return 13;
      case "ngp":
        return 14;
      case "gamegear":
        return 15;
      case "gc":
        return 16;
      case "atarijaguar":
        return 17;
      case "nds":
        return 18;
      case "ps2":
        return 21;
      case "atari2600":
        return 25;
      case "arcade":
        return 27;
      case "virtualboy":
        return 28;
      case "msx":
        return 29;
      case "sg-1000":
        return 33;
      case "amstradcpc":
        return 37;
      case "saturn":
        return 39;
      case "dreamcast":
        return 40;
      case "psp":
        return 41;
      case "3do":
        return 43;
      case "colecovision":
        return 44;
      case "intelivision":
        return 45;
      case "vectrex":
        return 46;
      case "atari7800":
        return 51;
      case "wonderswan":
        return 53;
      case "neogeocd":
        return 56;
      case "pcenginecd":
        return 76;
      case "atarijaguarcd":
        return 77;
      default:
        return "ID desconocido";
    }
  }

  const getDataAchievements = async (serverAPI, setStateAchievements, stateAchievements, platformID, hash) => {
    //console.log("Asking for Achievements");
    //console.log(`generateGameLists_retroAchievements ${hash} ${platformID}`);

    serverAPI
      .callPluginMethod("emudeck", { command: `generateGameLists_retroAchievements ${hash} ${platformID}` })
      .then((response: any) => {
        //console.log({ response });
        const result = response.result;
        const achievements: any = JSON.parse(result);
        //console.log("Saving Settings to StateAchievements");

        type Achievement = {
          DateEarned?: string;
          DateEarnedHardcore?: string;
          [key: string]: any; // Para permitir otras propiedades dinámicas
        };
        const isAchievement = (obj: unknown): obj is Achievement => {
          return typeof obj === "object" && obj !== null && ("DateEarned" in obj || "DateEarnedHardcore" in obj);
        };

        let earned = {};
        let earnedHardcore = {};
        let neither = {};

        // Iterar sobre cada entrada del objeto
        Object.entries(achievements.Achievements).forEach(([key, value]) => {
          if (isAchievement(value)) {
            if (value.DateEarned && value.DateEarnedHardcore) {
              earned[key] = value;
            } else if (value.DateEarnedHardcore) {
              earnedHardcore[key] = value;
            } else {
              neither[key] = value;
            }
          }
        });

        let earnedArray = Object.values(earned);
        let earnedHardcoreArray = Object.values(earnedHardcore);
        let neitherArray = Object.values(neither);

        setStateAchievements({
          ...stateAchievements,
          achievements,
          earned: earnedArray,
          earnedHardcore: earnedHardcoreArray,
          neither: neitherArray,
        });
      })
      .catch((error: any) => {
        console.log({ error });
      });
  };

  //
  // UseEffects
  //

  useEffect(() => {
    //console.log("getDataSettings launched");
    getDataSettings(serverAPI, setState, state);
  }, []);

  useEffect(() => {
    const gamesLS = sessionStorage.getItem("rom_library_games");
    if (gamesLS) {
      try {
        const partial = game_name_platform.split("|||");
        const name = partial[0];
        const platform = partial[1];
        const gamesJson: any = JSON.parse(gamesLS);
        const systemID = getIDByName(platform);
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
        //getDataAchievements(serverAPI, setStateAchievements, stateAchievements, systemID, filteredGame[0].hash);
      } catch (error) {
        console.error("Error al parsear los juegos:", error);
      }
    }
  }, [emuDeckConfig]);

  useEffect(() => {
    if (platform != undefined) {
      const systemID = getIDByName(platform);
      getDataAchievements(serverAPI, setStateAchievements, stateAchievements, systemID, game.hash);

      serverAPI
        .callPluginMethod("getJsonFromPlatform", {
          platform: platform,
        })
        .then((response: any) => {
          console.log({ response });
          if (response.success && response.result) {
            const additionalData = response.result;
            console.log({ additionalData });

            const filteredData = additionalData.games.filter((item: any) =>
              item.name?.toLowerCase().includes(game.name.toLowerCase())
            );
            // Actualizar el estado con los datos del juego y los datos adicionales
            setDataState(filteredData[0]);
          }
        })
        .catch((error) => {
          console.error("Error al llamar al método del plugin:", error);
        });
    }
  }, [platform]);

  // useEffect(() => {
  //   console.log({ stateAchievements });
  //   console.log(typeof stateAchievements.earned);
  // }, [stateAchievements]);
  //
  // Render
  //

  return (
    <>
      <style>{` ${styles} `}</style>
      {!game && (
        <div>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          NO GAME YET, loading
        </div>
      )}
      {game && (
        <>
          <div className="container--scroll">
            <div className="game-detail">
              <img
                src={`/customimages/retrolibrary/artwork/${game.platform}/media/box2dfront/${game.name}.jpg`}
                className="game-detail__blur"
              />
              <div className="game-detail__hero">
                {/* <img
                  className="game-detail__img"
                  src={`/customimages/retrolibrary/artwork/${game.platform}/media/screenshot/${game.name}.jpg`}
                  alt={game.name}
                /> */}
                <img
                  className="game-detail__logo"
                  src={`/customimages/retrolibrary/artwork/${game.platform}/media/wheel/${game.name}.png`}
                  alt={game.name}
                />
              </div>
              <div className="game-detail-data">
                <div className="game-detail__info">
                  <div className="game-detail__info-btn _3cI5TXsFX3bvpR-7EBOtxq">
                    <Button
                      className="game-detail__play-btn _3ydigb6zZAjJ0JCDgHwSYA _2AzIX5kl9k6JnxLfR5H4kX"
                      onClick={() => launchGame(launcher, game.filename, game.name, game.platform)}>
                      Play
                    </Button>
                  </div>

                  <div className="game-detail__info-last-played">
                    <span>Last Played</span>
                    -NYI-
                  </div>
                  <div className="game-detail__info-play-time">
                    <span>Play Time</span>
                    -NYI-
                  </div>

                  {stateAchievements.achievements != null && (
                    <>
                      <div className="game-detail__info-achievements">
                        <span>Achievements</span>
                        {stateAchievements.achievements.NumAwardedToUser} /{" "}
                        {stateAchievements.achievements.NumAchievements}
                      </div>
                      <div className="game-detail__info-achievements">
                        <span>Achievements Hardcore</span>
                        {stateAchievements.achievements.NumAwardedToUserHardcore} /{" "}
                        {stateAchievements.achievements.NumAchievements}
                      </div>
                    </>
                  )}
                </div>
                <div className="game-detail__cloud">
                  <span>CloudSync: Up to date</span>
                </div>

                {dataState && (
                  <div>
                    <h3>Game Info</h3>
                    <div className="game-detail__more_info">
                      <div className="game-detail__more_info-img">
                        <img
                          src={`/customimages/retrolibrary/artwork/${game.platform}/media/box2dfront/${game.name}.jpg`}
                          alt={game.name}
                        />
                      </div>
                      <div className="game-detail__more_info-data">
                        <div className="game-detail__more_info-data__top">
                          {dataState.description.substring(0, 180)}...
                        </div>
                        <div className="game-detail__more_info-data__bottom">
                          <ul className="list">
                            <li className="game-detail__more_info-data-developer">
                              <span>Developer: </span>
                              {dataState.developer ? dataState.developer : "???"}
                            </li>
                            <li className="game-detail__more_info-data-publisher">
                              <span>Publisher: </span>
                              {dataState.publisher ? dataState.publisher : "???"}
                            </li>
                            <li className="game-detail__more_info-data-date">
                              <span>Release Date: </span>
                              {dataState.release_date ? dataState.release_date : "???"}
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="game-detail__more_info-list">
                        <ul className="list">
                          <li>
                            <span>Players: </span>
                            {dataState.players}
                          </li>
                          <li>
                            <span>Genre: </span>
                            {dataState.genre}
                          </li>
                          <li>
                            <span>Rating: </span>
                            {dataState.rating}
                          </li>
                          <li>
                            <span>Emulator: </span>RetroArch
                          </li>
                        </ul>
                      </div>
                    </div>{" "}
                  </div>
                )}

                {stateAchievements.achievements != null && (
                  <>
                    <h3>Achievements</h3>
                    <Button className="game-detail__achievements">
                      <div className="game-detail__achievements__progress">
                        You've unclocked {stateAchievements.achievements.NumAwardedToUser} /{" "}
                        {stateAchievements.achievements.NumAchievements}{" "}
                      </div>
                      <div className="game-detail__achievements__inner">
                        <div className="game-detail__achievements__unlocked">
                          {earned.map((item: any) => {
                            return (
                              <img
                                className="_2V2sHETNfa62yMoDwSF3_t"
                                src={`https://media.retroachievements.org/Badge/${item.BadgeName}.png`}
                                loading="lazy"
                              />
                            );
                          })}
                        </div>
                        <div className="game-detail__achievements__locked-title">Locked achievements</div>
                        <div className="game-detail__achievements__locked">
                          {neither.map((item: any) => {
                            return (
                              <img
                                className="_2V2sHETNfa62yMoDwSF3_t"
                                src={`https://media.retroachievements.org/Badge/${item.BadgeName}_lock.png`}
                                loading="lazy"
                              />
                            );
                          })}
                        </div>
                      </div>
                    </Button>
                    <h3>Achievements Hardcore</h3>
                    <Button className="game-detail__achievements">
                      <div className="game-detail__achievements__progress">
                        You've unlocked {stateAchievements.achievements.NumAwardedToUserHardcore} /{" "}
                        {stateAchievements.achievements.NumAchievements}
                      </div>
                      <div className="game-detail__achievements__inner">
                        <div className="game-detail__achievements__unlocked">
                          {earnedHardcore.map((item: any) => {
                            return (
                              <img
                                className="_2V2sHETNfa62yMoDwSF3_t"
                                src={`https://media.retroachievements.org/Badge/${item.BadgeName}.png`}
                                loading="lazy"
                              />
                            );
                          })}
                        </div>
                        <div className="game-detail__achievements__locked-title">Locked achievements</div>
                        <div className="game-detail__achievements__locked">
                          {neither.map((item: any) => {
                            return (
                              <img
                                className="_2V2sHETNfa62yMoDwSF3_t"
                                src={`https://media.retroachievements.org/Badge/${item.BadgeName}_lock.png`}
                                loading="lazy"
                              />
                            );
                          })}
                        </div>
                      </div>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export { GameDetail };

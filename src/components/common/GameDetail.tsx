import { VFC, useState, useEffect, useRef } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField } from "decky-frontend-lib";
import { launchApp } from "common/steamshortcuts";
import { getTranslateFunc } from "TranslationsF";
import { Game } from "components/common/Game";
import { getDataSettings, launchGame, getDataAchievements, getDataStates } from "common/helpers";
import { useFetchCond } from "hooks/useFetchCond";

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
    height: 180px;
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
    platform: undefined,
    launcher: undefined,
    states: undefined,
    emuDeckConfig: {
      systemOS: "",
    },
  });
  const [stateTabs, setStateTabs] = useState<any>(undefined);
  const [stateAchievements, setStateAchievements] = useState<any>({
    achievements: null,
    earned: null,
    earnedHardcore: null,
    neither: null,
  });
  const [percentage, setPercentage] = useState(0);
  const [currentTab, setCurrentTab] = useState<string>("Tab1");
  const [dataState, setDataState] = useState<any>(undefined);
  const [lastSelectedGameKey, setLastSelectedGameKey] = useState<string | null>(null);

  let { game, launcher, emuDeckConfig, platform } = state;
  const { systemOS } = emuDeckConfig;

  const { achievements, earned, earnedHardcore, neither } = stateAchievements;

  //
  // Const & Vars
  //
  const t = getTranslateFunc();
  const dataWS = useFetchCond(
    `https://steamloopback.host/customimages/retrolibrary/data/${game_name_platform.split("|||")[1]}.json`
  );
  console.log({ dataWS });
  //
  // Functions
  //

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
    const gamesLS = sessionStorage.getItem("rom_library_games");
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
        //getDataAchievements(serverAPI, setStateAchievements, stateAchievements, platform, filteredGame[0].hash);
      } catch (error) {
        console.error("Error al parsear los juegos:", error);
      }
    }
  }, [emuDeckConfig]);

  useEffect(() => {
    if (platform != undefined) {
      dataWS.post({}).then((data) => {
        const additionalData = data;
        console.log({ additionalData });
        const filteredData = additionalData.games.filter((item: any) =>
          item.name?.toLowerCase().includes(game.name.toLowerCase())
        );
        // Actualizar el estado con los datos del juego y los datos adicionales
        setDataState(filteredData[0]);
        getDataAchievements(serverAPI, setStateAchievements, stateAchievements, platform, game.hash);
        getDataStates(serverAPI, setState, state, game.name);
      });
    }
  }, [platform]);

  useEffect(() => {
    console.log({ state });
  }, [state]);
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
                      ref={buttonRef}
                      focusable={true}
                      noFocusRing={false}
                      className="game-detail__play-btn _3ydigb6zZAjJ0JCDgHwSYA _2AzIX5kl9k6JnxLfR5H4kX"
                      onClick={() =>
                        launchGame(serverAPI, launcher, game.filename, game.name, game.platform, emuDeckConfig)
                      }>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none">
                        <path
                          d="M7.5 32.135a1 1 0 0 1-1.5-.866V4.73a1 1 0 0 1 1.5-.866l22.999 13.269a1 1 0 0 1 0 1.732l-23 13.269Z"
                          fill="currentColor"></path>
                      </svg>{" "}
                      Play
                    </Button>
                  </div>
{/*
                  <div className="game-detail__info-last-played">
                    <span>Last Played</span>
                    -NYI-
                  </div>
                  <div className="game-detail__info-play-time">
                    <span>Play Time</span>
                    -NYI-
                  </div>
*/}
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
{/*
                <div className="game-detail__cloud">
                  <span>CloudSync: Up to date</span>
                </div>
*/}
                <div className="game-detail__tabs">
                  {dataState && dataState.description && (
                    <>
                      <h3>Game Info</h3>
                      <Focusable onActivate={() => console.log("activated")}>
                        <div tabIndex={0} className="game-detail__more_info">
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
                      </Focusable>
                    </>
                  )}
                  {/*
                  <>
                    {state.states != null && (
                      <Focusable onActivate={() => console.log("activated")}>
                        <h3>Save States</h3>
                        <div tabIndex={0} className="game-detail__achievements">
                          <div className="game-detail__achievements__inner">
                            <div className="game-detail__achievements__unlocked">
                              {state.states.map((item: any) => {
                                return (
                                  <img
                                    className="_2V2sHETNfa62yMoDwSF3_t"
                                    src={`/customimages/retrolibrary/artwork/${game.platform}/media/box2dfront/${game.name}.jpg`}
                                    loading="lazy"
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </Focusable>
                    )}

                    {stateAchievements.achievements != null && (
                      <Focusable onActivate={() => console.log("activated")}>
                        <h3>Achievements</h3>
                        <div tabIndex={0} className="game-detail__achievements">
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
                        </div>
                        <h3>Achievements Hardcore</h3>
                        <div tabIndex={0} className="game-detail__achievements">
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
                        </div>
                      </Focusable>
                    )}
                  </>
                  */}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export { GameDetail };

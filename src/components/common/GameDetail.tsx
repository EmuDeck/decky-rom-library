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
  .game-detail{
    position:relative
  }

  .game-detail__blur{
    position:absolute !important;
    pointer-events:none;
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
    left: 0%;
    bottom: 10px;
    height: 50%;
  }

  .game-detail-data{
    padding: 18px 28px;
    background: rgba(14,20,27,.25);
    font-family: "Motiva Sans", Helvetica, sans-serif;
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

`;
  //
  // State
  //

  const [state, setState] = useState<any>({
    game: undefined,
    launcher: undefined,
    emuDeckConfig: {
      systemOS: "",
    },
  });
  const [percentage, setPercentage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastSelectedGameKey, setLastSelectedGameKey] = useState<string | null>(null);

  let { game, launcher, emuDeckConfig } = state;
  const { systemOS } = emuDeckConfig;
  //
  // Const & Vars
  //
  const t = getTranslateFunc();
  //
  // Functions
  //
  const launchGame = (launcher: string, game: string, name: string, platform: string) => {
    console.log({ launcher, game, name, platform });
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

  //
  // UseEffects
  //
  useEffect(() => {
    const gamesLS = sessionStorage.getItem("rom_library_games");
    if (gamesLS) {
      try {
        const partial = game_name_platform.split("|||");
        const name = partial[0];
        const platform = partial[1];
        const gamesJson: any = JSON.parse(gamesLS);
        const filteredPlatform = gamesJson.filter((item: any) =>
          item.id?.toLowerCase().includes(platform.toLowerCase())
        );

        if (filteredPlatform.length === 0) {
          console.error("No se encontró ninguna plataforma que coincida con", platform);
          return;
        }

        const gamesArray = filteredPlatform[0]?.games;

        if (!Array.isArray(gamesArray)) {
          console.error("La plataforma no contiene un array de juegos");
          return;
        }

        const filteredGame = gamesArray.filter((game: any) => game.name?.toLowerCase().includes(name.toLowerCase()));

        setState({ ...state, game: filteredGame[0], launcher: filteredPlatform[0].launcher });
      } catch (error) {
        console.error("Error al parsear los juegos:", error);
      }
    }
  }, []);

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
                src="/assets/584400_library_hero_blur.jpg?c=1598794567"
                className="game-detail__blur HNbe3eZf6H7dtJ042x1vM HSQWw9HUAP6jtA2OZjS-u _3_IUVzR9tpG_JKEjhwXEAb"
              />
              <div className="game-detail__hero">
                <img
                  className="game-detail__img"
                  src="/customimages/2853093163_hero.png?v=1731968956"
                  alt={game.name}
                />
                <img className="game-detail__logo" src="/assets/584400_logo.png?c=1598794567" alt={game.name} />
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
                    Sep 00
                  </div>
                  <div className="game-detail__info-play-time">
                    <span>Play Time</span>
                    00h
                  </div>
                  <div className="game-detail__info-achievements">
                    <span>Achievements</span>
                    0/00
                  </div>
                </div>
                <div className="game-detail__cloud">
                  <span>CloudSync: Up to date</span>
                </div>
                <h3>Achievements</h3>
                <Focusable className="game-detail__achievements">
                  <div className="game-detail__achievements__progress">You've unclocked 0/00 (00%) </div>
                  <div className="game-detail__achievements__inner">
                    <div className="game-detail__achievements__unlocked">
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/344ad8d2f2fa02dd7e96e204e9752ab30d205002.jpg"
                        loading="lazy"
                      />
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/344ad8d2f2fa02dd7e96e204e9752ab30d205002.jpg"
                        loading="lazy"
                      />
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/344ad8d2f2fa02dd7e96e204e9752ab30d205002.jpg"
                        loading="lazy"
                      />
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/344ad8d2f2fa02dd7e96e204e9752ab30d205002.jpg"
                        loading="lazy"
                      />
                    </div>
                    <div className="game-detail__achievements__locked-title">Locked achievements</div>
                    <div className="game-detail__achievements__locked">
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/258ac2a09144ee1347822d552a55b3029f5e672d.jpg"
                        loading="lazy"
                      />
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/258ac2a09144ee1347822d552a55b3029f5e672d.jpg"
                        loading="lazy"
                      />
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/258ac2a09144ee1347822d552a55b3029f5e672d.jpg"
                        loading="lazy"
                      />
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/258ac2a09144ee1347822d552a55b3029f5e672d.jpg"
                        loading="lazy"
                      />
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/258ac2a09144ee1347822d552a55b3029f5e672d.jpg"
                        loading="lazy"
                      />
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/258ac2a09144ee1347822d552a55b3029f5e672d.jpg"
                        loading="lazy"
                      />
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/258ac2a09144ee1347822d552a55b3029f5e672d.jpg"
                        loading="lazy"
                      />
                      <img
                        className="_2V2sHETNfa62yMoDwSF3_t"
                        src="https://cdn.steamstatic.com/steamcommunity/public/images/apps/584400/258ac2a09144ee1347822d552a55b3029f5e672d.jpg"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </Focusable>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export { GameDetail };

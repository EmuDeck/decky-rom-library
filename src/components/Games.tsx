import { VFC, useState, useEffect } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField } from "decky-frontend-lib";
import { launchApp, getCurrentUserId } from "../common/steamshortcuts";
import { getTranslateFunc } from "../TranslationsF";

const Games: VFC<{ serverAPI: any }> = ({ serverAPI }) => {
  const [state, setState] = useState<any>({
    games: undefined,
    tabs: undefined,
    emuDeckConfig: {
      cloud_sync_status: undefined,
      netPlay: undefined,
      RABezels: undefined,
      RAHandClassic2D: undefined,
      RAHandClassic3D: undefined,
      RAHandHeldShader: undefined,
      RAautoSave: undefined,
      arClassic3D: undefined,
      arDolphin: undefined,
      arSega: undefined,
      arSnes: undefined,
      branch: null,
      systemOS: "",
      toolsPath: undefined,
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  let { games, tabs, emuDeckConfig } = state;
  const { systemOS } = emuDeckConfig;
  const [currentTab, setCurrentTab] = useState<string>("Tab1");
  const t = getTranslateFunc();

  const getDataGames = async () => {
    const userId = getCurrentUserId();
    await serverAPI.callPluginMethod("emudeck", { command: `generateGameLists` });
    serverAPI.callPluginMethod("emudeck", { command: `generateGameListsJson` }).then((response: any) => {
      const result: any = response.result;
      const gameList: any = JSON.parse(result);
      gameList.sort((a: any, b: any) => a.title.localeCompare(b.title));
      setState({ ...state, games: gameList });
    });
  };

  const getData = async (update: Boolean) => {
    await serverAPI.callPluginMethod("getSettings", {}).then((response: any) => {
      const result: any = response.result;
      const emuDeckConfig: any = JSON.parse(result);
      setState({ ...state, emuDeckConfig });
    });
  };

  useEffect(() => {
    if (emuDeckConfig.systemOS !== "") {
      getDataGames();
      const TabLastID = localStorage.getItem("emudeck_rom_library_current_tab");
      if (TabLastID) {
        setCurrentTab(TabLastID);
      }
    }
  }, [emuDeckConfig]);

  useEffect(() => {
    getData(false);
  }, []);

  const [visibleCount, setVisibleCount] = useState(20);

  // Maneja el evento de scroll para cargar más elementos
  const loadMore = () => {
    //if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    // Aumenta el límite de elementos visibles en 20
    setVisibleCount((prevCount) => prevCount + 5);
    //}
  };

  useEffect(() => {
    if (games) {
      const tabs = games.map((item: any) => {
        const filteredGames = item.games.filter((game: any) =>
          game.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return {
          title: item.title,
          id: item.id,
          content: (
            <>
              <Focusable className="games__search">
                <TextField
                  value={searchTerm}
                  placeholder="Search games..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: "8px", width: "100%", fontSize: "1rem" }}
                />
              </Focusable>
              <Focusable className="games">
                {filteredGames.slice(0, visibleCount).map((game: any) => {
                  const random = Math.floor(Math.random() * 10000);
                  return (
                    <Button
                      className="game"
                      key={game.name}
                      onClick={() => launchGame(item.launcher, game.filename, game.name)}
                      onSecondaryActionDescription={"Fix Artwork"}
                      onOKActionDescription="Launch"
                      onCancelActionDescription="Exit"
                      onSecondaryButton={() => fixArtwork(game.name)}
                      onButtonDown={() => loadMore()}>
                      <img
                        loading="lazy"
                        className="game__img"
                        src={`${game.img}?id=${random}`}
                        alt={game.name.replace(/_/g, " ")}
                      />
                      <img
                        loading="lazy"
                        className="game__cartridge"
                        src={`/customimages/emudeck/default/${game.platform}.png?id=${random}`}
                        alt="Super Nintendo"
                      />
                      <img loading="lazy" className="game__bg" src={`${game.img}?id=${random}`} alt={game.name} />
                      <div className="game__file">
                        <span>{game.file}</span>
                      </div>
                    </Button>
                  );
                })}
              </Focusable>
            </>
          ),
        };
      });
      setState({ ...state, tabs: tabs });
    }
  }, [games, searchTerm, visibleCount]);

  const setFav = async (game) => {
    console.log("HEY");
  };

  const launchGame = (launcher: string, game: string, name: string) => {
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
    launchApp(serverAPI, { name, exec: launcherComplete }, systemOS);
  };

  const fixArtwork = (game) => {
    sessionStorage.setItem("game", game);
    Router.Navigate("/emudeck-rom-artwork");
  };

  return (
    <div style={{ marginTop: "40px", height: "calc(100% - 40px)", background: "#0e141b" }}>
      <style>{`
        .games{
          // display: flex;
          // flex-wrap: wrap;
          // gap:15px;
          // height:100%;
          grid-template-columns: repeat(auto-fill, 133px);
          grid-auto-rows: 199.5px;
          gap: 42px 16px;
          font-size: 18.1364px;
          padding-left: 8px;
          padding-right: 8px;
          display: grid;
          box-sizing: border-box;
          user-select: none;
          width: 100%;
          height: auto;
          padding: 8px 0px;
          grid-auto-flow: row;
          justify-content: space-between;
        }


        .games__search{
          margin-bottom:12px;
        }


        .game{
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
          transform: scale(0.98)
          background:#efefef

        }
        .game.gpfocus, .game:hover{
          transition-duration: .05s;
          transition-timing-function: ease-out;
          filter: brightness(0.8) contrast(1.05) saturate(1);
          transform: scale(1.08)
        }


        .game__img{
          display: inline-block;
           font-family: Arial, sans-serif;
           font-weight: 300;
           line-height: 2;
           text-align: center;
           width:100%;
           position: relative;
           z-index:3;
           min-height: 108px;
        }

        @keyframes marquee {
         0%   {
         transform: translateX(100%);
         }
         100% {
         transform: translateX(-100%);
         }
        }

        .game__file{
          background: rgba(0,0,0,0.6);
          width: 100%;
          height: 24px;
          line-height: 24px;
          position: absolute;
          bottom: 0;
          right: 0;
          left:0;
          overflow:hidden;
          z-index:9;
          opacity:0;
          transition: .5s
        }

        .game.gpfocus .game__file{
          opacity:1;
          transition: .5s
        }

        .game__file span{
          transform:translateX(100%);
          animation: marquee 5s linear infinite;
          display:block;
          color:#fff
        }

        .game__title{
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          margin: auto;
          font-size: 16px;
          display: block;
          line-height: 195px;
          text-transform: uppercase;
        }

        .game__cartridge{
          position: absolute;
          width: 100%;
          left: 0;
          top: 0;
        }

        .game__img:before{
          content: " ";
          display: block;
          position: absolute;
          top: -10px;
          left: 0;
          height: calc(100% + 10px);
          width: 100%;
          background-color: rgb(111 111 111);
        }

        .game__img:after{
           line-height: 24px;
           content: attr(alt);
           display: block;
           font-size: 20px;
           font-weight: bold;
           position: absolute;
           top: 0;
           bottom: 0;
           margin: auto;
           height: 92px;
           left: 0;
           width: 96%;
           text-align: center;
           letter-spacing: -0.1em;
           text-transform: uppercase;
           color: #e7e6e6;
           font-style: italic
        }

        .game__bg{
           width: 130px;
           height: 200px;
           position: absolute;
           z-index: -99;
           transform: translateY(0%) translateX(-100%) scaleX(0.8) scaleY(0.8);
           margin: auto;
           padding-top: 0 !important;
           filter: saturate(3) brightness(200%) blur(50px);
           opacity: 0;
           object-fit: fill;
           pointer-events: none;
           transition-property: opacity, transform;
           transition-duration: .4s;
           transition-timing-function: ease-in-out;
        }
        .game.gpfocus  .game__bg, .game:hover  .game__bg{
          opacity: 0.4;
          transform: translateY(0%) translateX(-100%) scaleX(1) scaleY(1);
          transition-property: opacity, transform;
        }
      `}</style>
      {!tabs && (
        <div style={{ textAlign: "center", height: "100vh" }}>
          <SteamSpinner>
            <p>{t("loadingGames")}</p>
          </SteamSpinner>
        </div>
      )}
      {tabs && (
        <Tabs
          activeTab={currentTab}
          onShowTab={(tabID: string) => {
            setCurrentTab(tabID);
            localStorage.setItem("emudeck_rom_library_current_tab", tabID);
          }}
          tabs={tabs}
        />
      )}
    </div>
  );
};

export { Games };

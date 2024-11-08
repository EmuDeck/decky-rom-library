import { VFC, useState, useEffect } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField, DialogButton } from "decky-frontend-lib";
import { launchApp, getCurrentUserId } from "../common/steamshortcuts";
import { getTranslateFunc } from "../TranslationsF";
import { useFetchCond } from "../hooks/useFetchCond";

const Artwork: VFC<{ serverAPI: any }> = ({ serverAPI }) => {
  const [state, setState] = useState<any>({ games: [], tabs: undefined });
  let { games, tabs } = state;
  const [stateSearch, setStateSearch] = useState<any>({ gamesSearch: undefined });
  let { gamesSearch } = state;
  const [stateInput, setStateInput] = useState<any>({ searchInput: undefined });
  let { searchInput } = stateInput;
  const [currentTab, setCurrentTab] = useState<string>("Tab1");
  const [stateModal, setStateModal] = useState<any>(false);
  const t = getTranslateFunc();
  const gameSS = sessionStorage.getItem("game");
  const imgsWS = useFetchCond(`https://bot.emudeck.com/steamdbimgs.php?name=${gameSS}`);

  useEffect(() => {
    setStateInput({ searchInput: sessionStorage.getItem("game") });
    imgsWS.post({}).then((data) => {
      console.log({ data });
      setState({ ...state, games: data });
    });
  }, []);

  useEffect(() => {
    console.log({ state });
  }, [state]);

  useEffect(() => {
    console.log({ stateSearch });
  }, [stateSearch]);

  useEffect(() => {
    console.log({ stateInput });
  }, [stateInput]);

  useEffect(() => {
    if (games) {
      const tabs = [
        {
          title: `Alternatives to ${gameSS}`,
          id: "Tab1",
          content: (
            <Focusable className="games">
              {games.map((game: any) => {
                return (
                  <Button
                    className="game"
                    key={game.id}
                    onClick={() => {
                      getImage(game.thumb, gameSS);
                    }}>
                    <img className="game__img" src={game.thumb} />
                    <img className="game__bg" src={game.thumb} />
                  </Button>
                );
              })}
            </Focusable>
          ),
        },
        {
          title: "Search",
          id: "Tab2",
          content: (
            <Focusable>
              <TextField
                label="Search"
                onChange={(e) => {
                  console.log(e.target.value);
                  setStateInput({ searchInput: e.target.value });
                }}
              />
              <DialogButton
                onClick={() => {
                  console.log({ searchInput });
                  getImages(searchInput);
                }}>
                <span>Search</span>
              </DialogButton>
            </Focusable>
          ),
        },
      ];

      setState({ ...state, tabs: tabs });
    }
  }, [games]);

  useEffect(() => {
    if (gamesSearch) {
      const tabs = [
        {
          title: "Search Results",
          id: "Tab1",
          content: (
            <Focusable className="games">
              {gamesSearch.map((game: any) => {
                return (
                  <Button
                    className="game"
                    key={game.id}
                    onClick={() => {
                      getImage(game.thumb, gameSS);
                    }}>
                    <img className="game__img" src={game.thumb} />
                    <img className="game__bg" src={game.thumb} />
                  </Button>
                );
              })}
            </Focusable>
          ),
        },
        {
          title: "Search",
          id: "Tab2",
          content: (
            <Focusable>
              <TextField
                label="Search"
                value="tron"
                onChange={(e) => {
                  console.log(e.target.value);
                  setStateInput({ searchInput: e.target.value });
                }}
              />
              <DialogButton
                onClick={() => {
                  console.log({ searchInput });
                  getImages(searchInput);
                }}>
                <span>Search</span>
              </DialogButton>
            </Focusable>
          ),
        },
      ];

      setState({ ...state, tabs: tabs });
    }
  }, [gamesSearch]);

  const getImages = (name: string) => {
    console.log({ name });
    const url = `https://bot.emudeck.com/steamdbimgs.php?name=${name}`;
    fetch(url)
      .then((response) => {
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        // Convertir la respuesta a JSON
        return response.json();
      })
      .then((data) => {
        // Manejar los datos recibidos
        setState({ ...state, games: data });
        setCurrentTab("Tab1");
      })
      .catch((error) => {
        // Manejar cualquier error que ocurra
        console.error("There has been a problem with your fetch operation:", error);
      });
  };

  const getImage = async (url: string, name: any) => {
    setStateModal(true);

    console.log({ url });
    console.log({ name });

    await serverAPI
      .callPluginMethod("emudeck", {
        command: `saveImage ${url} ${name}`,
      })
      .then((result: any) => {
        console.log({ result });
        Router.Navigate("/emudeck-rom-library");
      });
  };

  return (
    <div
      style={{
        marginTop: "40px",
        height: "calc(100% - 40px)",
        background: "#0e141b",
      }}>
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
           height:100%;
           position: relative;
        }

        .game__img:before{
          content: '';
           width: 100%;
           height: 100%;
           background-color: #efefef;
           position: absolute;
           top: 0;
           left: 0;
        }

        .game__img:after{
          content: attr(alt);
           font-size: 18px;
           color: rgb(100, 100, 100);
           display: block;
           position: absolute;
           z-index: 2;
           top: 5px;
           left: 0;
           width: 100%;
           height: 100%;
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

      {stateModal && (
        <div>
          <div style={{ textAlign: "center", height: "100vh" }}>
            <SteamSpinner>
              <p>Downloading artwork...</p>
            </SteamSpinner>
          </div>
        </div>
      )}
      {!tabs && (
        <div>
          <div style={{ textAlign: "center", height: "100vh" }}>
            <SteamSpinner>
              <p>{t("loadingGames")}</p>
            </SteamSpinner>
          </div>
        </div>
      )}

      {tabs && !stateModal && (
        <Tabs
          activeTab={currentTab}
          onShowTab={(tabID: string) => {
            setCurrentTab(tabID);
          }}
          tabs={tabs}
        />
      )}
    </div>
  );
};

export { Artwork };

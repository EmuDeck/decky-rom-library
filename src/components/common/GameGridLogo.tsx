import { VFC, useState, useEffect } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField } from "decky-frontend-lib";
import { launchApp } from "common/steamshortcuts";
import { getTranslateFunc } from "TranslationsF";
import { GameLogo } from "components/common/GameLogo";
import { GameWii } from "components/common/GameWii";
import { getDataGames, getDataSettings } from "common/helpers";
import { routePathGameDetail } from "init";
const GameGridLogo: VFC<{ serverAPI: any; platform: any; retro: boolean }> = ({ serverAPI, platform = "", retro }) => {
  const styles = `
  #tvshape {
      position: relative;
      width: 200px;
      height: 150px;
      margin: 20px 10px;
      background: #0809fe;
      border-radius: 50% / 10%;
      color: white;
      text-align: center;
      text-indent: .1em;
  }

  #tvshape:before {
      content: "";
      position: absolute;
      top: 10%;
      bottom: 10%;
      right: -5%;
      left: -5%;
      background: inherit;
      border-radius: 5% / 50%;
  }
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


  .games{
    grid-template-columns: repeat(auto-fill, 243px);
    grid-auto-rows: 199px;
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

  .retro .games{
    grid-template-columns: repeat(auto-fill, 26vw);
  }

  /* 3:2 */
  .games--32{
    grid-auto-rows: 148px;
  }

  /* 4:3 */
  .games--crt{
    grid-auto-rows: 182px;
  }

  /* 16:9 */
  .games--hdtv{
    grid-auto-rows: 136px;
  }

  /* 1:1 */
  .games--square{
    grid-auto-rows: 243px;
  }

  .games--square .game__img,
  .games--rectangle .game__img{
    object-fit:cover;
    height:100%
  }

  .games--rectangle{
    grid-auto-rows: 136px;
  }

  .games__search{
    margin-bottom:12px;
    width: 100%;
  }


  .game{
    border:0px;
    padding:0;
    line-height:0;
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
  .game.gpfocus, .game:hover{
    transition-duration: .05s;
    transition-timing-function: ease-out;
    filter: brightness(0.8) contrast(1.05) saturate(1);
    transform: scale(1.08);
  }

  .game__img-holder{
    overflow: hidden;
    display: block;
    position: relative;
    height: 100%;
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

  .game--ss{
    filter: brightness(50%)
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
    transform: translateY(-90%) translateX(-100%) scaleX(1) scaleY(1);
    transition-property: opacity, transform;
  }

  .parser-counter{
    position: absolute;
    bottom: 50px;
    right: 0;
    padding: 6px 20px;
    font-size: 12px;
    background: rgba(0, 0, 0, .8);
  }

  img.game__logo {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      margin: auto;
      z-index: 2;
      width: 75%;
  }

  img.game__ss {
      position: absolute;
      top: 0;
      left: 0;
      margin: auto;
      bottom: 0;
      width: 100%;
      filter: brightness(40%);
  }

  img.game__tint{
    display:none;
    background-color: green;
    mix-blend-mode: color;
    position: absolute;
  }
  .gb img.game__tint{
    isplay: block;
    background-color: green;
    mix-blend-mode: color;
    position: absolute;
    z-index: 1;
    pointer-events: none;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }


    #Footer, #header{
      display:none !important
    }

 /* Retro only */

    .bezel-left,
    .bezel-right{
      position:absolute;
      top:0;
      left:0;
      height:100vh;
      z-index:10000;
      width:6%;
      overflow:hidden;
      display:none;
    }

    .retro .bezel-left,
    .retro .bezel-right{
      display:block
    }

    .retro .container{
      padding: 0 8vw;
      padding-top: 36px;
    }

    .bezel-left img,
    .bezel-right img{
      position:absolute;
      top:0;
      left:-180%;
      height:100%;
    }

    .bezel-right,
    .bezel-right img{
      left:auto;
      right:0;
    }

    .bezel-right img{
      right: -180%;
    }

    :root{
      --grad-1: 83,83,83;
      --grad-2: 75,75,77;
      --grad-3: 34,36,39;
      --grad-4: 38,39,44;
      --grad-5: 45,46,50;
    }

    .retro.n64,
    .retro.n64dd,
    .retro.psx,
    .retro.gc,
    .retro.atarijaguar,
    .retro.atarijaguarcd,
    .retro.atari800,
    .retro.atari2600,
    .retro.atari5200,
    .retro.atari7800,
    .retro.amstradcpc,
    .retro.channelf,
    .retro.colecovision,
    .retro.markIII,
    .retro.msx,
    .retro.msx2,
    .retro.odyssey2,
    .retro.supergrafx,
    .retro.thomson,
    .retro.ti99,
    .retro.zxspectrum
    {
      --grad-1: 25,25,25;
      --grad-2: 30,30,32;
      --grad-3: 19,19,20;
      --grad-4: 14,14,14;
      --grad-5: 45,46,50;
    }

    .retro.gx4000{
      --grad-1: 25,25,25;
      --grad-2: 30,30,32;
      --grad-3: 19,19,20;
      --grad-4: 14,14,14;
      --grad-5: 45,46,50;
    }

    .retro.intellivision{
      --grad-1: 49,40,33;
      --grad-2: 48,43,37;
      --grad-3: 31,26,19;
      --grad-4: 18,18,18);
      --grad-5: 45,46,50;
    }
    .retro.pcengine,
    .retro.pcenginecd,
    .retro.pc88,
    .retro.pc98,
    .retro.pcfx
     {
      --grad-1: 176,176,176;
      --grad-2: 177,177,177;
      --grad-3: 85,84,84;
      --grad-4: 74,74,74;
      --grad-5: 106,106,106;
    }

    .retro.nes{
      --grad-1: 230,230,230;
      --grad-2: 174,174,177;
      --grad-3: 18,18,18;
      --grad-4: 21,22,23;
      --grad-5: 45,46,50;
    }

    .retro.segacd,
    .retro.genesis,
    .retro.sega32x,
    .retro.mastersystem,
    .retro.megadrive,
    .retro.sg1000
    {
      --grad-1: 72,13,13;
      --grad-2: 78,20,20;
      --grad-3: 43,4,4;
      --grad-4: 45,13,13;
      --grad-5: 45,46,50;
    }

    .retro.dreamcast,
    .retro.saturn,
    .retro.ps2{
      --grad-1: 52,64,174;
      --grad-2: 81,87,111;
      --grad-3: 13,35,41;
      --grad-4: 25,29,108;
      --grad-5: 69,70,74;
    }
    .retro:before,
    .retro:after{
      position:absolute;
      z-index:9
    }
    .retro:before{
      content:'';
      display:block;
      width:100%;
      height: 1.4vw;
      background: rgb(83,83,83);
      background: linear-gradient(180deg, rgba(var(--grad-1),1) 0%, rgba(var(--grad-2),1) 42%, rgba(var(--grad-3),1) 43%, rgba(var(--grad-4),1) 79%, rgba(var(--grad-5),1) 100%)
    }



    .retro:after{
      content:'';
      display:block;
      width:100%;
      height: 1.4vw;
      position:absolute;
      bottom:0;
      background: rgb(83,83,83);
      background: rgb(83,83,83);
      background: linear-gradient(0deg, rgba(var(--grad-1),1) 0%, rgba(var(--grad-2),1) 42%, rgba(var(--grad-3),1) 43%, rgba(var(--grad-4),1) 79%, rgba(var(--grad-5),1) 100%)
    }

    .retro h1{
      display:none !important;
    }

    .retro.wii:after,
    .retro.wii:before,
    .retro.wiiu:after,
    .retro.wiiu:before,
    .retro.ps3:after,
    .retro.ps3:before,
    .retro.ps4:after,
    .retro.ps4:before,
    .retro.psp:after,
    .retro.psp:before,
    .retro.psp:after,
    .retro.psp:before,
    .retro.xbox360:after,
    .retro.xbox360:before,
    .retro.n3ds:after,
    .retro.n3ds:before,
    .retro.ds:after,
    .retro.ds:before,
    .retro.switch:after,
    .retro.switch:before
    {
      display:none !important;
    }

    .retro.wii .container,
    .retro.wiiu .container,
    .retro.ps3 .container,
    .retro.ps4 .container,
    .retro.psp .container,
    .retro.psp .container,
    .retro.xbox360 .container,
    .retro.n3ds .container,
    .retro.ds .container,
    .retro.switch .container{
      padding-left: 2.8vw;
      padding-right: 2.8vw;
    }

    .retro.wii .bezel,
    .retro.wiiu .bezel,
    .retro.ps3 .bezel,
    .retro.ps4 .bezel,
    .retro.psp .bezel,
    .retro.psp .bezel,
    .retro.xbox360 .bezel,
    .retro.n3ds .bezel,
    .retro.ds .bezel,
    .retro.switch .bezel
    {
      display:none !important;
    }

    .retro.xbox360 .container{
      background: linear-gradient(0, #ababad, #4f4f51);
    }

    .retro.xbox360 ._3ZR32BdxJUNwAA6Fu6n00p,
    .retro.n3ds ._3ZR32BdxJUNwAA6Fu6n00p,
    .retro.wii ._3ZR32BdxJUNwAA6Fu6n00p{
      background: #fff
    }

    .retro.xbox360 .games{
      justify-content: center;
      gap:5px;
    }

    .retro.xbox360 .game.gpfocus, .retro.xbox360 .game:hover{
      z-index:9
    }

    .retro.n3ds .container{
      background: #dfdbd7
    }

    .retro.n3ds .game{
      box-shadow: 0px 0px 10px 7px #726f6f;
      background:#fff;
      border-radius:10px;
      outline: 12px solid #fff
    }

    .retro.n3ds .game__img-holder{
      border-radius:10px;
    }

    .retro.wii .container{
      background: repeating-linear-gradient(
        0deg,
        #ccc,
        #ccc 2px,
        #fff 2px,
        #fff 4px
      );
      overflow: auto;

    }

    .retro.wii .game.gpfocus, .retro.wii .game:hover{
      transform: none;
    }
    .retro.wii .game{
      box-shadow:none
    }
    .retro.wii .game img.game__ss{
      height:100%
    }

    .retro.wii .games{
      justify-content: center;
      gap: 8px;
      grid-template-columns: repeat(auto-fill, 22vw);
      grid-auto-rows: 110px;
      height: 65vh;
      overflow: scroll;
      scroll-behavior: smooth;
    }

    @font-face {
      font-family: Digital;
      src:
        url("https://steamloopback.host/customimages/retrolibrary/assets/wii/digital-7.ttf");
    }

    .retro.wii .date{
      font-family: Digital;
      position: absolute;
      color: #9b9b9b;
      margin: auto;
      left: 0;
      right: 0;
      bottom: 11vh;
      z-index: 1;
      text-align: center;
      font-family: Digital;
      font-size: 34px;
      width: 200px;
    }
    .retro.wii .date:after{
      content: '';
      display: block;
      background: #f5f5f5;
      height: 61px;
      width: 300px;
      filter: blur(10px);
      border-radius: 100%;
      position: absolute;
      left: -50px;
      top: -12px;
      z-index: -1;
    }

    .frame-border {
        stroke: #b4b4b4;
        stroke-width: 8;
    }

    .retro.wii .game.gpfocus .frame-border , .retro.wii .game:hover .frame-border {
      stroke: #42c3de;
      stroke-width: 8;
    }

    .retro.gb .container:before {
        content: '';
        background: #00ff8d;
        width: 100%;
        height: calc(100% - 33px);
        z-index: 4;
        position: absolute;
        left: 0;
        right: 0;
        margin: auto;
        top: 18px;
        opacity: 0.4;
        border-radius: 8px;
    }

    .retro.wii .nav-wii,
    .retro.wii .nav-wii img{
        position: absolute;
        left: 0;
        bottom: -15px;
        height: 128px;
        width: 100%;
        z-index: 1;
        pointer-events: none;
    }

  `;
  //
  // State
  //

  const [state, setState] = useState<any>({
    games: undefined,
    tabs: undefined,
    emuDeckConfig: {
      systemOS: "",
    },
  });
  const [percentage, setPercentage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastSelectedGameKey, setLastSelectedGameKey] = useState<string | null>(null);

  let { games, tabs, emuDeckConfig } = state;
  const { systemOS } = emuDeckConfig;
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

  const loadGame = (name, platform) => {
    //console.log(`${routePathGameDetail}/${name}`);
    Router.Navigate(`${routePathGameDetail}/${name}|||${platform}`);
  };

  const fixArtwork = (game: any) => {
    sessionStorage.setItem("game", game);
    const gameKey = `${game.name}_${game.platform}`;
    //console.log({ gameKey });
    localStorage.setItem("last_selected_game_key", gameKey);
    Router.Navigate("/emudeck-rom-artwork");
  };
  const time = new Date();
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  //
  // UseEffects
  //

  useEffect(() => {
    const gamesLS = sessionStorage.getItem("rom_library_games");
    if (gamesLS) {
      try {
        const gamesJson: any = JSON.parse(gamesLS);
        //console.log({ gamesJson });
        setState({ ...state, games: gamesJson });
      } catch (error) {
        //console.error("Error al parsear los juegos:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (games) {
      //console.log({ games });
    }
  }, [games]);

  const arrayHDTV = ["wii", "wiiu", "switch", "xbox360", "psp", "ps4", "ps3", "n3ds"];
  let extraCSS;
  if (arrayHDTV.includes(platform)) {
    extraCSS = "games--hdtv";
  } else if (platform == "gb" || platform == "gbc") {
    extraCSS = "games--square";
  } else if (platform == "gba") {
    extraCSS = "games--32";
  } else {
    extraCSS = "games--crt";
  }

  //
  // Render
  //

  return (
    <>
      <style>{` ${styles} `}</style>
      {!games && <div>NO GAMES YET, loading</div>}
      {games && (
        <div className={`${platform} ${retro ? "retro" : ""}`}>
          {platform == "wii" && (
            <div className="nav-wii">
              <img src={`/customimages/retrolibrary/assets/wii/wii-bg.png`} />
            </div>
          )}
          <div className="bezel bezel-left">
            <img
              src={`/customimages/retrolibrary/assets/bezels/${platform}.png`}
              onError={(e: any) => (e.target.src = `/customimages/retrolibrary/assets/bezels/default.png`)}
            />
          </div>

          <div className="container container--scroll">
            {games
              .filter((category: any) => category.id === platform) // Filtra por plataforma antes de mapear
              .map((category: any) => {
                return (
                  <h1>
                    {category.title}
                    <small>{category.games.length} games</small>
                  </h1>
                );
              })}
            <Focusable className="games__search">
              <TextField
                value={searchTerm}
                placeholder="Search games..."
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px", width: "100%", fontSize: "1rem" }}
              />
            </Focusable>

            {}
            <Focusable className={`games ${extraCSS} ${platform} CSSGrid Grid Panel`}>
              {games
                .filter((category: any) => category.id === platform) // Filtra por plataforma antes de mapear
                .map((category: any) => {
                  // Mover la declaración de filteredGames aquí
                  const filteredGames = category.games.filter((game: any) =>
                    game.name.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  return filteredGames.map((game: any, index: number) => {
                    index = index + 1;
                    const random = Math.floor(Math.random() * 10000);
                    const gameKey = `${game.name}_${game.platform}`;
                    if (platform === "wii") {
                      return (
                        <GameWii
                          key={`${game.name}${game.platform}${random}`}
                          item={category}
                          random={random}
                          game={game}
                          loadGame={loadGame}
                          fixArtwork={fixArtwork}
                          focus={lastSelectedGameKey === gameKey || index === 1}
                        />
                      );
                    } else {
                      return (
                        <GameLogo
                          key={`${game.name}${game.platform}${random}`}
                          item={category}
                          random={random}
                          game={game}
                          loadGame={loadGame}
                          fixArtwork={fixArtwork}
                          focus={lastSelectedGameKey === gameKey || index === 1}
                        />
                      );
                    }
                  });
                })}
            </Focusable>
          </div>
          <div className="date">{formatTime(time)}</div>
          <div className="bezel bezel-right">
            <img
              src={`/customimages/retrolibrary/assets/bezels/${platform}.png`}
              onError={(e: any) => (e.target.src = `/customimages/retrolibrary/assets/bezels/default.png`)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export { GameGridLogo };

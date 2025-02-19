import { VFC, useState, useEffect } from "react";
import { Tabs, Button, Focusable, SteamSpinner, Router, TextField } from "decky-frontend-lib";
import { launchApp } from "common/steamshortcuts";
import { getTranslateFunc } from "TranslationsF";
import { GameStore } from "components/common/GameStore";
import { GameWii } from "components/common/GameWii";
import { getDataGames, getDataSettings } from "common/helpers";
import { routeStoreDetail } from "init";
const GameGridLogoStore: VFC<{ serverAPI: any; platform: any; retro: boolean }> = ({
  serverAPI,
  platform = "",
  retro,
}) => {
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

      object-fit: cover;
      height: 100%;
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
    .retro.wii ._3ZR32BdxJUNwAA6Fu6n00p,
    .retro.switch ._3ZR32BdxJUNwAA6Fu6n00p
    {
      background: #fff
    }

    .retro.xbox360 .games{
      justify-content: center;
      gap:5px;
      grid-auto-rows: 124px
    }

    .retro.xbox360 .game.gpfocus, .retro.xbox360 .game:hover{
      z-index:9
    }

    .retro.xbox360 .games .game:nth-child(3n){
      grid-row: span 2;
    }

    .retro.xbox360 .games .game:last-child{
      grid-row: span 1;
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
        to bottom,
        #f5f5f5 0px,
        #f5f5f5 2px,
        #e5e5e5 2px,
        #e5e5e5 9px
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

    .date{
      display:none
    }

    .retro.wii .date{
      display:block;
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

    .retro.switch .container{
      background: #ebebeb;
      padding:0;
    }

    .retro.switch .games{
      grid-template-columns: repeat(auto-fill, 17vw);
      gap: 4px;
      height: calc(88vh - 56px);
      overflow:scroll;
      grid-auto-rows: 15vw;
      border-top: 1.5px solid #9a9a9a;
      padding: 56px 2.8vw;
      border-bottom: 1.5px solid #9a9a9a;
      padding-top: 56px;
      scroll-padding-top: 56px;
      scroll-padding-bottom: 16px;
      justify-content: center;
    }

    @keyframes outlineColorChange {
      0% {
        outline-color: #52fcdb;
      }
      50% {
        outline-color: #19b1c1;
      }
      100% {
        outline-color: #52fcdb;
      }
    }

    .retro.switch .game.gpfocus, .retro.switch .game:hover{
      transition-duration: .05s;
      transition-timing-function: ease-out;
      filter: brightness(0.8) contrast(1.05) saturate(1);
      transform: scale(1);
      outline: 4px solid #19b1c1;
      animation: outlineColorChange 3s infinite;
    }


    .retro.switch .game {
        transform: scale(1);
    }

    .games__search-logo{
      display:none
    }

    .retro.switch .games__search-holder{
      display:flex;
      padding: 16px 32px;
      justify-content: space-between;
    }

    .retro.switch .games__search-logo{
      display:flex;
      align-items: center;

    }

    .retro.switch .games__search-logo svg{
      width: 32px;
      padding-right:16px;
    }

    .retro.switch .games__search-logo span{
      color: #1d1d1d;
    }

    .retro.switch .games__search{
      flex-basis: 50%;
      margin-bottom:0;
    }

    .retro.switch ._3ZR32BdxJUNwAA6Fu6n00p{
      outline: 4px solid #52fcdb
    }


    .games__footer{
      display: none
    }

    .retro.switch .games__footer{
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: center;
    }

    .games__footer-deck{
      width: 84px;
      padding-left: 10px;
      padding-top: 3px;

    }

    .games__footer-buttons{
      display: flex;
      color: #2d2d2d;
      gap: 18px;
      list-style: none;
      padding-right: 24px;
    }

    .games__footer-buttons span:first-child{
      margin-right: 8px;
      background: #292929;
      color: #fff;
      display: inline-block;
      width: 24px;
      height: 24px;
      text-align: center;
      border-radius: 100%;
    }

    .retro.ps4 .container{
      background: linear-gradient(0, #223788, #6a88ca);
    }

    .container__bg{
      display:none
    }

    .retro.ps4 .container__bg,
    .retro.ps4 .container__bg video{
      display:block;
      position:absolute;
      top:0;
      left:0;
      width:100vw;
      height:100vh;
      z-index:999999999
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

  const loadGame = (name, platform) => {
    console.log(`${routeStoreDetail}/${name}|||${platform}`);
    Router.Navigate(`${routeStoreDetail}/${name}|||${platform}`);
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
    const gamesLS = sessionStorage.getItem("rom_store_games");
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

  const arrayHDTV = ["wii", "wiiu", "xbox360", "psp", "ps3", "n3ds"];
  let extraCSS;
  if (arrayHDTV.includes(platform)) {
    extraCSS = "games--hdtv";
  } else if (platform == "gb" || platform == "gbc" || platform == "switch" || platform == "ps4") {
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
            <div className="container__bg">
              <video src="/customimages/retrolibrary/assets/ps4/ps4.mp4"></video>
            </div>

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

            <div className="games__search-holder">
              <div className="games__search-logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34.83 34.76">
                  <path
                    fill="none"
                    stroke="#1d1d1d"
                    stroke-miterlimit="10"
                    stroke-width="2.83"
                    d="M1.42 1.42h13.3v13.3H1.42zm18.69 0h13.3v13.3h-13.3zM1.42 20.04h13.3v13.3H1.42zm18.69 0h13.3v13.3h-13.3z"
                  />
                </svg>
                <span>Games</span>
              </div>
              <Focusable className="games__search">
                <TextField
                  value={searchTerm}
                  placeholder="Search games..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: "8px", width: "100%", fontSize: "1rem" }}
                />
              </Focusable>
            </div>
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
                        <GameStore
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
            <div className="games__footer">
              <div className="games__footer-deck">
                <svg
                  id="uuid-372c5a8a-ad6e-4d23-a9d4-1ecf672fd035"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 840.25 363.45">
                  <g id="uuid-e981a167-ae91-4ca7-b28d-852b22e43106">
                    <g>
                      <path d="M416.52,20.19c116.09,0,232.17-.01,348.26,.01,19.67,0,35.29,8.29,46.79,24.04,6.62,9.07,10.21,19.42,10.26,30.78,.08,17.49,.04,34.98,.04,52.48,0,.6-.01,1.22-.14,1.81-.23,1.03-.86,1.68-1.99,1.68-.69,0-1.39,0-2.08,.01-11.52,0-23.04,.03-34.57,0-3.87,0-7.37,.93-10.21,3.7-2.83,2.76-4.62,6.02-4.64,10.08-.01,4.68-.02,9.35-.02,14.03,0,16.45-.02,32.91,0,49.36,0,8.77-2.55,16.8-7.72,23.78-14.71,19.88-29.63,39.6-44.46,59.39-7.15,9.55-14.32,19.1-21.38,28.71-2.73,3.71-4.19,7.93-4.08,12.61,.01,.43,.01,.87-.02,1.3-.14,2.12-.57,2.59-2.67,2.63-3.46,.06-6.93,.05-10.4,.05-164.25,0-328.5,0-492.76,0-13.17,0-26.34,0-39.5-.02-3.71,0-3.9-.17-3.87-3.77,.04-5.34-1.86-9.98-4.99-14.17-8.69-11.64-17.44-23.23-26.16-34.86-8.71-11.62-17.41-23.26-26.11-34.89-4.4-5.88-8.82-11.76-13.19-17.66-2.82-3.81-4.44-8.17-5.81-12.66-1.26-4.11-1.44-8.32-1.42-12.58,.05-19.66,.02-39.31,.02-58.97,0-2.87-.13-5.68-1.57-8.31-2.22-4.04-5.43-6.67-10-7.49-1.35-.24-2.76-.28-4.14-.28-10.83-.02-21.66,0-32.49,0-3.56,0-3.93-.36-3.93-3.81,0-16.8,.01-33.6,0-50.4-.01-13.61,4.47-25.62,13.06-36.08,4.88-5.94,10.78-10.69,17.65-14.23,7.83-4.04,16.12-6.17,24.93-6.27,2.95-.03,5.89-.02,8.84-.02,113.49,0,226.97,0,340.46,0h0Zm.15,14.31h0c-76.14,0-152.27,0-228.41,0-.78,0-1.56,0-2.33,.09-2.33,.3-3.76,1.72-4.02,4.05-.12,1.11-.08,2.25-.08,3.37,0,58.01,0,116.02,0,174.03,0,34.37,0,68.75-.01,103.12,0,4.75,1.38,6.14,6.21,6.22,2.25,.04,4.5,0,6.76,0,121.01,0,242.01,0,363.02,0,28.93,0,57.86,0,86.79,0,.95,0,1.91,.02,2.85-.11,2.65-.37,3.99-1.81,4.19-4.47,.09-1.21,.05-2.42,.05-3.63,0-91.95-.01-183.9,.04-275.85,0-5.31-1.64-6.87-6.9-6.86-76.05,.06-152.1,.04-228.15,.04ZM81.35,80.18s0-.02,0-.03c2.25,0,4.51,.04,6.76,0,2.92-.06,3.88-.97,3.95-3.94,.08-3.55,.09-7.1,.01-10.65-.07-3.33-1.06-4.22-4.48-4.24-3.9-.03-7.8-.02-11.69-.01q-4.28,0-4.29-4.36c0-4.07,.05-8.14-.05-12.21-.07-2.74-1.05-3.81-3.51-3.86-3.98-.08-7.97-.06-11.95,.03-2.06,.05-3.12,1.16-3.35,3.24-.09,.86-.07,1.73-.07,2.6-.01,3.9,.01,7.79-.02,11.69-.02,2.59-.26,2.83-2.83,2.86-4.33,.05-8.66,.02-12.99,.05-3.62,.02-4.57,.97-4.61,4.67-.04,3.2-.03,6.41,0,9.61,.04,3.63,.96,4.53,4.7,4.56,4.24,.03,8.49,0,12.73,.02,2.77,.02,2.95,.23,3.02,2.94,.03,1.21,0,2.42,0,3.64,0,3.38-.04,6.76,.04,10.13,.06,2.37,.97,3.59,3.16,3.67,4.24,.17,8.49,.15,12.72,0,1.86-.06,2.72-1.14,2.95-3.04,.1-.77,.07-1.56,.07-2.34,0-3.81,0-7.62,.01-11.43,.02-3.37,.22-3.57,3.49-3.59,2.08-.01,4.16,0,6.24,0Zm86.77,5.05c.42-15.47-12.7-28.39-27.8-28.69-15.36-.31-28.7,12.3-29,27.8-.31,16.07,12.78,28.83,27.97,29.05,16.2,.23,29.03-13.3,28.82-28.16Zm495.7-.31c-.45,14.99,12.42,28.44,28.23,28.48,16.16,.04,28.65-13.35,28.55-28.75-.1-15.35-13.27-28.15-28.43-28.13-15.88,.02-28.73,13.56-28.36,28.4ZM171.33,175.21h0c0-3.98,0-7.96,0-11.94,0-5.97-.01-11.94,0-17.92,.01-4.65-1.94-8.35-5.41-11.31-2.86-2.44-6.29-3.05-9.94-3.05-19.14,.02-38.27,0-57.41,.02-1.21,0-2.42,.09-3.63,.19-3.27,.27-5.88,1.84-8.13,4.13-3.04,3.1-4.13,6.92-4.13,11.12-.02,19.13-.01,38.25-.01,57.38,0,.52-.02,1.04,.03,1.56,.53,5.53,2.9,9.86,7.99,12.5,2.4,1.24,4.96,1.45,7.56,1.45,12.47,.02,24.94,.01,37.4,.01,6.93,0,13.85-.01,20.78,0,4.16,.01,7.89-1.12,10.79-4.21,2.78-2.96,4.14-6.47,4.11-10.6-.07-9.78-.02-19.56-.02-29.34Zm578.55-.11c0-9.69,.06-19.39-.05-29.08-.02-2.03-.26-4.22-1.02-6.07-2.57-6.19-7.43-8.99-14.1-8.98-18.79,.05-37.58,.02-56.37,.04-1.73,0-3.47,.03-5.18,.26-4.11,.54-7.15,2.76-9.42,6.18-1.84,2.78-2.47,5.85-2.47,9.12,0,19.04,0,38.08,0,57.13,0,.52-.02,1.04,.02,1.56,.46,5.77,2.98,10.22,8.3,12.84,2.32,1.14,4.82,1.28,7.35,1.28,18.1,0,36.19,0,54.29,0,1.99,0,3.98,0,5.97-.12,3.54-.23,6.43-1.83,8.84-4.38,2.77-2.93,3.86-6.45,3.84-10.42-.04-9.78-.01-19.56-.01-29.34ZM149.28,251.76s0,.04,0,.06c1.38,0,2.77,.02,4.15,0,3.02-.04,6.07,.11,9.07-.21,5.82-.61,9.12-7.67,6.05-12.65-1.77-2.87-4.33-4.41-7.7-4.44-5.62-.06-11.24-.04-16.85-.04-2.42,0-4.85-.11-7.26,.09-3.37,.28-5.92,2.09-7.23,5.15-1.2,2.81-1.1,5.71,.81,8.37,1.68,2.34,3.9,3.63,6.78,3.66,4.06,.04,8.12,0,12.19,0Zm534.17,.03v-.02c3.98,0,7.96,0,11.93,0,2.46,0,4.64-.78,6.23-2.67,2.19-2.6,3.13-5.54,1.76-8.89-1.46-3.54-4.15-5.6-7.93-5.67-7.95-.14-15.91-.02-23.87-.05-1.83,0-3.38,.73-4.83,1.66-3.12,2-4.5,6.07-3.31,9.53,1.33,3.87,4,5.97,8.08,6.08,3.98,.1,7.96,.02,11.93,.02Zm124.16-179.35c.22-5.86-4.34-11.74-11.52-11.89-7.18-.15-11.83,5.38-12.03,11.4-.22,6.41,4.65,11.98,11.56,12.15,6.84,.17,12.01-5.23,11.99-11.66Zm-47.21,23.65c-.38,6.41,5.63,11.9,11.85,11.83,6.28-.06,11.59-5.48,11.71-11.84,.1-5.45-4.75-11.79-11.98-11.77-6.79,.02-11.99,6.19-11.59,11.78Zm0-47.49c0,6.66,5.11,11.64,11.91,11.7,6.63,.06,11.7-5.79,11.65-11.78-.05-6.45-5.54-11.93-11.98-11.79-6.37,.13-11.84,5.61-11.57,11.87Zm-23.77,23.58c.12,7.05,5.18,11.93,11.74,11.91,7.08-.02,11.78-5.32,11.84-11.88,.05-5.51-4.26-11.54-11.82-11.61-6.54-.06-11.72,5.1-11.77,11.58Zm-9.67-37.66c-2.07,0-4.16-.13-6.22,.05-1.15,.1-2.42,.46-3.35,1.11-1.97,1.38-2.59,3.46-1.89,5.75,.73,2.38,2.55,3.84,4.96,3.95,4.4,.19,8.82,.2,13.22,0,2.92-.14,5.15-2.84,5.09-5.57-.06-2.9-2.17-5.07-5.32-5.25-2.15-.12-4.32-.02-6.48-.02Zm-620.23,0s0,.02,0,.02c-2.25,0-4.5-.11-6.74,.03-3.15,.19-5.25,2.39-5.26,5.29-.01,2.79,2.22,5.42,5.13,5.53,4.4,.17,8.83,.2,13.23-.01,3.08-.15,5.22-2.82,5.12-5.8-.09-2.78-2.14-4.83-5.25-5.04-2.07-.14-4.15-.03-6.22-.03Z" />
                      <path d="M821.88,199.1c0,17.83-.04,35.67,.02,53.5,.02,7.04-.45,14.02-2.27,20.84-1.56,5.86-3.61,11.55-6.34,16.97-4.31,8.56-9.78,16.29-16.54,23.1-7.08,7.12-15.15,12.88-24.3,17-8.69,3.92-17.86,6.04-27.42,6.09-15.85,.08-31.7,.02-47.54,.02-.43,0-.87,.02-1.3-.01-1.91-.14-2.39-.63-2.51-2.56-.28-4.77,1.05-9.06,3.89-12.88,7.12-9.57,14.25-19.14,21.4-28.69,8.65-11.56,17.34-23.09,25.99-34.65,6.47-8.65,13-17.27,19.33-26.03,3.07-4.24,4.71-9.17,5.94-14.25,1.08-4.43,1.16-8.9,1.15-13.4-.02-19.39,.02-38.78-.02-58.17,0-3.06,.62-5.82,2.7-8.16,2.41-2.72,5.47-3.75,9.04-3.73,8.57,.04,17.15,.01,25.72,.01,3.29,0,6.58-.02,9.87,.01,2.77,.03,3.17,.42,3.18,3.17,.02,10.99,0,21.99,0,32.98,0,9.61,0,19.22,0,28.83Z" />
                      <path d="M11.59,199.81c0-20.35,0-40.7,0-61.05,0-.78-.03-1.56,.03-2.34,.11-1.67,.57-2.13,2.18-2.3,.43-.05,.87-.02,1.3-.02,11.09,0,22.18,0,33.26,0,2.63,0,5.18,.27,7.4,1.92,2.62,1.95,4.34,4.44,4.7,7.73,.14,1.29,.11,2.59,.11,3.89,.01,19.83,.06,39.66,0,59.49-.03,10.61,3.25,20.02,9.6,28.46,9.82,13.06,19.6,26.15,29.4,39.22,6.9,9.2,13.84,18.37,20.74,27.57,4.67,6.22,9.33,12.46,13.96,18.71,2.71,3.65,4.19,7.71,3.93,12.33-.14,2.64-.57,3.19-3.25,3.2-5.98,.03-11.95,0-17.93,0-8.92,0-17.84,0-26.77,.01-7.06,.02-14.03-.85-20.75-2.95-10.53-3.29-19.92-8.67-28.24-15.96-9.65-8.46-17.13-18.53-22.42-30.18-4.7-10.35-7.3-21.23-7.28-32.67,.04-18.36,.01-36.71,.01-55.07h0Z" />
                      <path d="M416.59,322.29c-75.88,0-151.76,0-227.63,0-.61,0-1.22,.02-1.82-.06-1.57-.21-2.06-.73-2.21-2.36-.08-.86-.05-1.73-.05-2.6,0-89.01,0-178.02,0-267.02,0-3.29-.03-6.58,.04-9.87,.05-2.21,.58-2.7,2.79-2.85,.69-.05,1.39-.02,2.08-.02,151.5,0,302.99,0,454.49,.02,.35,0,.69,0,1.04,0,2.76,.09,3.19,.49,3.29,3.16,.04,1.04,.02,2.08,.02,3.12,0,90.91,0,181.83,0,272.74,0,1.13,.04,2.26-.06,3.37-.14,1.59-.66,2.1-2.27,2.29-.77,.09-1.56,.06-2.34,.06-75.79,0-151.58,0-227.37,0h0Zm.14-270.44c-66.61,0-133.23,0-199.84,0-5.24,0-5.84,.57-5.85,5.8-.01,11.52,0,23.03,0,34.55,0,69.53,0,139.06,0,208.59,0,1.04-.03,2.08,.02,3.12,.13,2.97,1.01,3.88,3.9,4.05,.95,.06,1.91,.04,2.86,.04,132.88,0,265.76,0,398.65,0,.87,0,1.74,.03,2.6-.06,2.24-.22,3.06-1.02,3.28-3.28,.11-1.2,.06-2.42,.06-3.63,.02-81.39,.04-162.79,.06-244.18,0-.69-.02-1.39-.16-2.07-.42-2.04-1.27-2.75-3.39-2.91-.86-.06-1.73-.03-2.6-.03-66.53,0-133.06,0-199.58,0Z" />
                      <path d="M119.35,85.02c-.7-11.33,9.79-20.7,20.15-20.63,11.44,.08,20.62,9.09,20.81,20.41,.18,11.07-9.24,20.61-20.47,20.72-11.29,.11-21.17-9.74-20.49-20.5Zm20.38-17.38c-8.94-.3-17.22,7.75-17.33,17.08-.1,9.46,7.72,17.58,17.36,17.58,10.1,0,17.4-8.7,17.35-17.34-.05-9.28-8.06-17.58-17.39-17.32Z" />
                      <path d="M712.62,84.71c.6,10.9-8.83,20.68-20.25,20.81-11.52,.13-20.63-9.54-20.79-20.15-.17-11.52,9.26-20.6,19.99-20.99,11.03-.39,21.38,9.04,21.04,20.32Zm-20.47,17.53c9.37,.36,17.37-7.89,17.36-17.25,0-9.93-8.54-17.26-17.07-17.39-9.42-.14-17.62,7.94-17.67,17.37-.04,8.72,7.52,17.6,17.38,17.27Z" />
                      <path d="M168.19,175.26c0,9.61,0,19.22,0,28.83,0,2.16-.13,4.27-1.25,6.28-1.83,3.26-4.45,5.23-8.15,5.72-.94,.13-1.9,.18-2.85,.18-19.23,0-38.45,0-57.68,0-2.62,0-5.15-.26-7.41-1.86-3.13-2.21-4.68-5.23-5.06-8.94-.06-.6-.03-1.21-.03-1.82,0-19.04,.02-38.09-.02-57.13,0-2.6,.53-5.02,1.84-7.19,1.74-2.89,4.32-4.69,7.76-5.05,1.03-.11,2.07-.16,3.11-.16,19.23,0,38.45,0,57.68,0,2.63,0,5.15,.3,7.39,1.94,2.51,1.84,4.07,4.22,4.5,7.28,.18,1.28,.17,2.59,.18,3.89,.01,9.35,0,18.7,0,28.05Z" />
                      <path d="M705.62,216.24c-9.79,0-19.57-.02-29.36,.01-4.08,.01-7.47-1.33-9.82-4.77-1.39-2.04-2.12-4.34-2.12-6.84,0-3.55,0-7.1,0-10.65,0-15.84,.03-31.69,0-47.53,0-2.13,.35-4.15,1.24-6.05,1.48-3.15,3.85-5.31,7.35-5.95,1.44-.26,2.92-.35,4.39-.35,19.05-.03,38.11,.02,57.16-.05,4.94-.02,8.87,1.61,11.09,6.15,.77,1.57,1.08,3.46,1.17,5.23,.18,3.63,.06,7.27,.06,10.91,0,15.76,0,31.51,0,47.27,0,2.42-.08,4.8-1.41,7.02-1.97,3.3-4.75,5.18-8.56,5.54-.86,.08-1.73,.09-2.59,.09-9.53,0-19.05,0-28.58,0v-.03Z" />
                    </g>
                  </g>
                </svg>
              </div>
              <ul className="games__footer-buttons">
                <li>
                  <span>B</span>
                  <span>Back</span>
                </li>

                <li>
                  <span>A</span>
                  <span>OK</span>
                </li>
              </ul>
            </div>
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

export { GameGridLogoStore };

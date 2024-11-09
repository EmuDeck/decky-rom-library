import { VFC, useState, useEffect } from "react";
import { Button } from "decky-frontend-lib";

const Game = ({ item, game, random, launchGame, fixArtwork, loadMore, setIsFocus, isFocus }) => {
  return (
    <Button
      className="game"
      onClick={() => launchGame(item.launcher, game.filename, game.name)}
      onSecondaryActionDescription={"Fix Artwork"}
      onOKActionDescription="Launch"
      onCancelActionDescription="Exit"
      onSecondaryButton={() => fixArtwork(game.name)}
      onButtonDown={() => loadMore()}>
      {isFocus && (
        <div
          className="_1sTuvqUAeproqHEae5sn9z"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: "0px",
            left: "0px",
          }}></div>
      )}
      <img loading="lazy" className="game__img" src={`${game.img}?id=${random}`} alt={game.name.replace(/_/g, " ")} />
      {/* <img
        loading="lazy"
        className="game__cartridge"
        src={`/customimages/emudeck/default/${game.platform}.png?id=${random}`}
        alt="Super Nintendo"
      /> */}
      <img loading="lazy" className="game__bg" src={`${game.img}?id=${random}`} alt={game.name} />
      <div className="game__file">
        <span>{game.file}</span>
      </div>
    </Button>
  );
};

export { Game };

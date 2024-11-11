import { VFC, useState, useEffect, useRef } from "react";
import { Button } from "decky-frontend-lib";

const Game = ({ item, game, random, launchGame, fixArtwork, loadMore, focus }) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        root: null, // viewport
        rootMargin: "0px", // no margin
        threshold: 0.5, // 50% of target visible
      }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    // Clean up the observer
    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Si 'focus' es verdadero, simula el foco en el elemento
    if (focus && targetRef.current) {
      setIsFocus(true); // Cambia el estado a enfocado
      if (targetRef.current) {
        const focusGame: any = targetRef.current;
        focusGame.focus();
        focusGame.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [focus]);

  return (
    <Button
      ref={targetRef}
      className="game"
      onGamepadFocus={() => setIsFocus(true)}
      onGamepadBlur={() => setIsFocus(false)}
      onClick={() => launchGame(item.launcher, game.filename, game.name, game.platform)}
      onSecondaryActionDescription={"Fix Artwork"}
      onOKActionDescription="Launch"
      onCancelActionDescription="Exit"
      onSecondaryButton={() => fixArtwork(game)}
      onButtonDown={() => loadMore()}>
      {isVisible && (
        <img loading="lazy" className="game__img" src={`${game.img}?id=${random}`} alt={game.name.replace(/_/g, " ")} />
      )}
      {/* <img
        loading="lazy"
        className="game__cartridge"
        src={`/customimages/emudeck/default/${game.platform}.png?id=${random}`}
        alt="Super Nintendo"
      /> */}
      {isFocus && (
        <>
          <div
            className="_1sTuvqUAeproqHEae5sn9z"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: "0px",
              left: "0px",
            }}></div>

          <img loading="lazy" className="game__bg" src={`${game.img}?id=${random}`} alt={game.name} />
          <div className="game__file">
            <span>{game.file}</span>
          </div>
        </>
      )}
    </Button>
  );
};

export { Game };
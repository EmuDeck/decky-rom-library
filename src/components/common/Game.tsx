import { VFC, useState, useEffect, useRef } from "react";
import { Button } from "decky-frontend-lib";

const Game = ({ item, game, random, loadGame, fixArtwork, focus }) => {
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
        threshold: 0.3, // 50% of target visible
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
      onClick={() => loadGame(game.file, game.platform)}
      //onSecondaryActionDescription={"Fix Artwork"}
      onOKActionDescription="Launch"
      onCancelActionDescription="Exit"
      //onSecondaryButton={() => fixArtwork(game)}
    >
      {isVisible && (
        <span className="game__img-holder">
          <img
            loading="lazy"
            className="game__img"
            src={`${game.img}/box2dfront/${game.name}.jpg?id=${random}`}
            alt={game.name.replace(/_/g, " ")}
          />
        </span>
      )}
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
          <img
            loading="lazy"
            className="game__bg"
            src={`${game.img}/box2dfront/${game.name}.jpg?id=${random}`}
            alt={game.name}
          />
          <div className="game__file">
            <span>{game.og_name}</span>
          </div>
        </>
      )}
    </Button>
  );
};

export { Game };

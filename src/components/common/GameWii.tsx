import { VFC, useState, useEffect, useRef } from "react";
import { Button } from "decky-frontend-lib";

const GameWii = ({ item, game, random, loadGame, fixArtwork, focus }) => {
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
        <div className="game__img-holder">
          <img
            loading="lazy"
            className="game__logo"
            src={`${game.img}/wheel/${game.name}.png?id=${random}`}
            onError={(e: any) => (e.target.style.display = "none")}
            alt={game.name.replace(/_/g, " ")}
          />
          <svg className="game__ss" viewBox="0 0 390.35 215.33" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id="mask">
                <rect fill="#000000" x="0" y="0" width="390.35" height="215.33"></rect>
                <path
                  fill="#ffffff"
                  d="M2.83 106.74c0-45.23 4.42-77.65 4.42-77.65s.5-21.95 21.23-23c22.18-1.13 73.16-3.1 138.34-3.1h19.62l7.65-.15h29.56c65.18 0 116.16 1.98 138.34 3.1 20.73 1.05 21.23 23 21.23 23s4.31 32.46 4.31 77.69v2c0 45.23-3.49 77.76-3.49 77.76s-.5 21.95-21.23 23c-22.18 1.13-73.16 3.1-138.34 3.1H193.1l-27.09-.15c-65.18 0-116.16-1.98-138.34-3.1-20.73-1.05-21.23-23-21.23-23s-3.6-32.27-3.6-77.5v-2Z"
                />
              </mask>
            </defs>
            <image
              mask="url(#mask)"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              xlinkHref={`${game.img}/screenshot/${game.name}.jpg?id=${random}`}
              x="0"
              y="0"
              width="100%"></image>
            <g className="frame-border" fill="none">
              <path d="M2.83 106.74c0-45.23 4.42-77.65 4.42-77.65s.5-21.95 21.23-23c22.18-1.13 73.16-3.1 138.34-3.1h19.62l7.65-.15h29.56c65.18 0 116.16 1.98 138.34 3.1 20.73 1.05 21.23 23 21.23 23s4.31 32.46 4.31 77.69v2c0 45.23-3.49 77.76-3.49 77.76s-.5 21.95-21.23 23c-22.18 1.13-73.16 3.1-138.34 3.1H193.1l-27.09-.15c-65.18 0-116.16-1.98-138.34-3.1-20.73-1.05-21.23-23-21.23-23s-3.6-32.27-3.6-77.5v-2Z" />
            </g>
          </svg>
        </div>
      )}
    </Button>
  );
};

export { GameWii };

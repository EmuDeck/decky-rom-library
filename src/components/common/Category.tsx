import { VFC, useState, useEffect, useRef } from "react";
import { Button } from "decky-frontend-lib";

const Category = ({ platform, onClick }) => {
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
        rootMargin: "300px", // no margin
        threshold: 0.1, // 50% of target visible
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

  // useEffect(() => {
  //   // Si 'focus' es verdadero, simula el foco en el elemento
  //   if (focus && targetRef.current) {
  //     setIsFocus(true); // Cambia el estado a enfocado
  //     if (targetRef.current) {
  //       const focusGame: any = targetRef.current;
  //       focusGame.focus();
  //       focusGame.scrollIntoView({ behavior: "smooth", block: "center" });
  //     }
  //   }
  // }, [focus]);

  return (
    <Button
      onClick={() => onClick()}
      ref={targetRef}
      className="_3IWn-2rn7x98o5fDd0rAxb "
      unminified-class="Collection Focusable">
      <div className="_2ERAQD94mxjbyV0G5P9ic5" unminified-class="CollectionImage">
        <div className="akZKnBQkmOCFmiD2JWwfo" unminified-class="CollectionBG">
          <div
            className="_1R9r2OBCxAmtuUVrgBEUBw _2E7G8grj_-tgxXbTXs1t2E _3Ehhd5MxErV_bXQE4qVhzB undefined _2I7jw4GCsxatT6FjGyk7c8"
            unminified-class="_1R9r2OBCxAmtuUVrgBEUBw GreyBackground _3Ehhd5MxErV_bXQE4qVhzB undefined BackgroundImage">
            {platform.games.slice(-1).map((game: any) => {
              const random = Math.floor(Math.random() * 10000);
              return (
                <img
                  className="_24_AuLm54JVe1Zc0AApCDR _3d_bT685lnWotXxgzKW6am yDr03475kalWBTwAE-Rnw"
                  alt={game.name.replace(/_/g, " ")}
                  src={`${game.img}?id=${random}`}
                  unminified-class="_24_AuLm54JVe1Zc0AApCDR Visibility yDr03475kalWBTwAE-Rnw"
                />
              );
            })}
          </div>
        </div>
        {isVisible && (
          <div className="_3n796D6GS1fdlXhRnRUfRv" unminified-class="DisplayCaseContainerBounds">
            <div className="_3vMgn8Qn1EVGWMwVbRBBUA" unminified-class="DisplayCaseContainer">
              <div className="_2UWA0lTcI8lQgQsbWucD8x" unminified-class="AppGrid">
                {platform.games.slice(-6).map((game: any) => {
                  const random = Math.floor(Math.random() * 10000);
                  return (
                    <div className="_2zbkblS0wKex2zlrf1kmkQ" unminified-class="_2zbkblS0wKex2zlrf1kmkQ">
                      <div
                        className="_1R9r2OBCxAmtuUVrgBEUBw _2E7G8grj_-tgxXbTXs1t2E _3Ehhd5MxErV_bXQE4qVhzB undefined _1Nb1zAXqh_mFJMZDAHu6L6"
                        unminified-class="_1R9r2OBCxAmtuUVrgBEUBw GreyBackground _3Ehhd5MxErV_bXQE4qVhzB undefined _1Nb1zAXqh_mFJMZDAHu6L6">
                        <img
                          className="_24_AuLm54JVe1Zc0AApCDR _3d_bT685lnWotXxgzKW6am yDr03475kalWBTwAE-Rnw"
                          src={`${game.img}?id=${random}`}
                          alt={game.name.replace(/_/g, " ")}
                          unminified-class="_24_AuLm54JVe1Zc0AApCDR Visibility yDr03475kalWBTwAE-Rnw"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="_1J1LQ0vGtpM3n0xw7XwQM6" unminified-class="CollectionLabel">
        <div>{platform.title}</div>
        <div className="_36QQLBgXFUVTOhU9jMkCWD" unminified-class="CollectionLabelCount">
          ( {platform.games.length} )
        </div>
      </div>
    </Button>
  );
};

export { Category };
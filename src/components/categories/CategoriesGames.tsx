import { VFC, useState } from "react";
import { Focusable, Button } from "decky-frontend-lib";

interface GamesProps {
  serverAPI: any; // Reemplaza 'any' con el tipo específico de serverAPI si está disponible
}

const CategoriesGames: VFC<GamesProps> = ({ serverAPI }) => {
  const items = [
    { id: 1, name: "Nintendo Entertainment System", description: "The iconic 8-bit console by Nintendo." },
    { id: 2, name: "Super Nintendo", description: "The 16-bit classic with titles like Super Mario World." },
    { id: 3, name: "Sega Genesis", description: "Sega's answer to the Super Nintendo." },
    { id: 4, name: "PlayStation", description: "Sony's first entry in the console market." },
    { id: 5, name: "Nintendo 64", description: "Home of titles like Super Mario 64 and Zelda: Ocarina of Time." },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFocusChange = (direction: string) => {
    if (direction === "next") {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    } else if (direction === "previous") {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
    }
  };

  const styles = `
  .grido{
    grid-auto-flow: row;
    display: grid;
    grid-template-columns: repeat(auto-fill, 133px);
    grid-auto-rows: 199.5px;
    justify-content: space-between;
    }
  `;

  return (
    <>
      <div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </div>
      <Focusable className="grido">
        <style>{styles}</style>
        {items.map((item, index) => (
          <Button key={item.id}>
            <div
              className={`pepe ${index === currentIndex ? "focused" : ""}`}
              onClick={() => handleFocusChange("next")}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          </Button>
        ))}
      </Focusable>
    </>
  );
};

export { CategoriesGames };

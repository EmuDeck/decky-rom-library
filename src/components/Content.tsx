import { PanelSection, PanelSectionRow, ServerAPI, SliderField } from "decky-frontend-lib";
import { VFC, useState, useEffect } from "react"; //import { GlobalContext } from "./context/globalContext";

const Content: VFC<{ serverAPI: ServerAPI }> = () => {
  const [state, setState] = useState(1);
  let counterMax: any;
  useEffect(() => {
    counterMax = localStorage.getItem("rom_library_counter_max");
    if (!counterMax) {
      counterMax = 1;
    }
    counterMax = parseInt(counterMax);
    setState(counterMax);
  }, []);
  return (
    <>
      <PanelSection title="Settings">
        <PanelSectionRow>
          <SliderField
            label="Recent Games"
            description="Number of recent games that will appear on your Home. Changing this value won't remove any current recent game you might have"
            value={state}
            step={1}
            max={16}
            min={1}
            resetValue={counterMax}
            showValue={true}
            onChange={(value) => {
              setState(value);
              localStorage.setItem("rom_library_counter_max", value.toString());
              localStorage.setItem("rom_library_counter", value.toString());
            }}
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title="Alternative Emulators">Coming soon...</PanelSection>
    </>
  ); // Return;
};

export default Content;

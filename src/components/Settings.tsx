import { PanelSection, PanelSectionRow, ServerAPI, SliderField, ToggleField } from "decky-frontend-lib";
import { VFC, useState, useEffect } from "react";
import defaultSettings from "defaults.js";
const Content: VFC<{ serverAPI: ServerAPI }> = () => {
  //
  // State
  //

  const [state, setState] = useState<any>(() => {
    const settingsStorage = localStorage.getItem("rom_library_settings");
    const storedSettings = settingsStorage ? JSON.parse(settingsStorage) : {};
    return { ...defaultSettings, ...storedSettings };
  });
  const { counter_max, vertical, counter, logo_grid } = state;
  //
  // Const & Vars
  //
  let counterMax: any;
  //
  // Functions
  //
  //
  useEffect(() => {
    localStorage.setItem("rom_library_settings", JSON.stringify(state));
  }, [state]);

  //
  // UseEffects
  //

  //
  // Render
  //
  return (
    <>
      <PanelSection title="Settings">
        <PanelSectionRow>
          <SliderField
            label="Recent Games"
            description="Number of recent games that will appear on your Home. Changing this value won't remove any current recent game you might have"
            value={counter_max == null ? 1 : counter_max}
            step={1}
            max={16}
            min={1}
            resetValue={counterMax}
            showValue={true}
            onChange={(value) => {
              setState({ ...state, counter_max: value });
            }}
          />
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title="Theme Settings">
        <PanelSectionRow>
          <ToggleField
            label="Horizontal Navigation"
            checked={vertical == true ? true : false}
            layout="below"
            onChange={() => setState({ ...state, vertical: !vertical })}
          />
          <ToggleField
            label="Logo Grid"
            checked={logo_grid == true ? true : false}
            layout="below"
            onChange={() => setState({ ...state, logo_grid: !logo_grid })}
          />
        </PanelSectionRow>
      </PanelSection>
    </>
  ); // Return;
};

export default Content;

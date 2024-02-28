import { useState } from "react";
import Customslider from "./Customslider";


const Lightsetter = ({ onChange, brightness, wavelength }) => {
  const [valueWavelength, setValueWavelength] = useState(wavelength);
  const [valueBrightness, setValueBrightness] = useState(brightness);

  const handleWavelengthChange = (values) => {
    setValueWavelength(values[0]);
    onChange({ valueWavelength: values[0], valueBrightness });
  };

  const handleBrightnessChange = (values) => {
    setValueBrightness(values[0]);
    onChange({ valueWavelength, valueBrightness: values[0] });
  };

  return (
    <div>
      <Customslider
        name="Wavelength"
        description="The visible light spectrum is the segment of the electromagnetic spectrum that the human eye can view."
        min={380}
        max={760}
        onChange={handleWavelengthChange}
        value={valueWavelength}
        defaultValue={wavelength}
      />
      <Customslider
        name="Brightness"
        description="Brightness refers to how much light appears to shine from something."
        min={0}
        max={100}
        onChange={handleBrightnessChange}
        value={valueBrightness}
        defaultValue={brightness}
      />
    </div>
  );
};

export default Lightsetter;

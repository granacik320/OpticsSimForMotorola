import Colorpicker from "./Colorpicker";
import Customslider from "./Customslider";
import Lightsetter from "./Lightsetter";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState } from "react";

const Light = ({ handleLightChange, wavelength, brightness }) => {
  return (
    <Tabs defaultValue="single">
      <HoverCard openDelay={200}>
        <HoverCardTrigger className="mr-[70px] font-bold text-lg">
          Light
        </HoverCardTrigger>
        <HoverCardContent className="w-[350px]" side="left">
          Set the color of the laser. When setting the color of the laser, you
          can opt for either wavelength or color spectrum. However, utilizing
          the color spectrum will require the simulator to generate numerous
          rays, which may be computationally intensive.
        </HoverCardContent>
      </HoverCard>
      <TabsList>
        <TabsTrigger value="single">Single</TabsTrigger>
        <TabsTrigger value="multi">Multi</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <Lightsetter
            onChange={handleLightChange}
            wavelength={wavelength}
            brightness={brightness}
        />
      </TabsContent>
      <TabsContent value="multi">
        <Colorpicker onChange={handleLightChange} />
      </TabsContent>
    </Tabs>
  );
};
const SoloLight = ({ handleLightChange, wavelength, brightness }) => {
  return (
    <>
      <HoverCard openDelay={200}>
        <HoverCardTrigger className="mr-[70px] font-bold text-lg">
          Light
        </HoverCardTrigger>
        <HoverCardContent className="w-[350px]" side="left">
          Set the color of the laser. When setting the color of the laser, you
          can opt for either wavelength or color spectrum. However, utilizing
          the color spectrum will require the simulator to generate numerous
          rays, which may be computationally intensive.
        </HoverCardContent>
      </HoverCard>
      <Lightsetter
          onChange={handleLightChange}
          wavelength={wavelength}
          brightness={brightness}
      />
    </>
  );
};

const RefractiveIndex = ({ onChange, refractiveIndex }) => {
  const [valueRefractiveIndex, setValueRefractiveIndex] = useState(refractiveIndex);

  const handleValueRefractiveIndexChange = (values) => {
    setValueRefractiveIndex(values[0]);
    onChange({refractiveIndex: values[0]});
  };

  return (
    <Customslider
      name="RefractiveIndex"
      description="The refractive index is the measure of bending of a light ray when passing from one medium to another."
      min={1}
      max={40}
      step={0.5}
      onChange={handleValueRefractiveIndexChange}
      value={valueRefractiveIndex}
      defaultValue={refractiveIndex || 1.5}
    />
  );
};

const CauchyCoeffient = ({ onChange, cauchyCoeffient }) => {
  const [valueCauchyCoeffient, setValueCauchyCoeffient] = useState(cauchyCoeffient);

  const handleValueCauchyCoeffient = (values) => {
    setValueCauchyCoeffient(values[0]);
    onChange({cauchyCoeffient: values[0]});
  };

  return (
    <Customslider
      name="Cauchy Coeffient"
      description="Cauchy's transmission equation is an empirical relationship between the refractive index and wavelength of light for a particular transparent material. B(μm2)"
      min={0.003}
      max={0.013}
      step={0.001}
      onChange={handleValueCauchyCoeffient}
      value={valueCauchyCoeffient}
      defaultValue={cauchyCoeffient}
    />
  );
};

const Lens = ({ onChange, curved, width }) => {
  const [valueCurved, setValueCurved] = useState(curved);
  const [valueWidth, setValueWidth] = useState(width);

  const handleValueCurved = (values) => {
    setValueCurved(values[0]);
    onChange({curved: values[0]});
  };

  const handleValueWidth = (values) => {
    setValueWidth(values[0]);
    onChange({width: values[0]});
  };

  return (
    <>
      <Customslider
          name="Curved"
          description="Curved of the lens."
          min={-40}
          max={40}
          onChange={handleValueCurved}
          value={valueCurved}
          defaultValue={curved}
      />
      <Customslider
          name="Width"
          description="Curved of the lens."
          min={-40}
          max={40}
          onChange={handleValueWidth}
          value={valueWidth}
          defaultValue={width}
      />
    </>
  );
};


const Propertiesbar = ({ selectedElement, onChangeLight, onChangeRefractiveIndex, onChangeCauchyCoeffient, onChangeLens}) => {
  const handleLightChange = (e) => {
    if(e.valueWavelength) selectedElement.wavelength = e.valueWavelength;
    if(e.valueBrightness) selectedElement.brightness = e.valueBrightness / 100;
    e.parent = selectedElement?.name;
    onChangeLight(e);
  };

  const handleRefractiveIndexChange = (e) => {
    selectedElement.refractiveIndex = e.refractiveIndex;
    onChangeRefractiveIndex(selectedElement?.name, e.refractiveIndex);
  };

  const handleCauchyCoeffientChange = (e) => {
    selectedElement.cauchyCoeffient = e.cauchyCoeffient;
    onChangeCauchyCoeffient(selectedElement?.name, e.cauchyCoeffient);
  };

  const handleLensChange = (e) => {
    if (e.curved) selectedElement.curved = e.curved;
    if (e.width) selectedElement.width = e.width;
    onChangeLens({name: selectedElement?.name, curved: e.curved, width: e.width});
  }

  const components = {
    light: (
      <Light
        handleLightChange={handleLightChange}
        wavelength={selectedElement?.wavelength}
        brightness={selectedElement?.brightness * 100}
      />
    ),
    refractiveIndex: (
      <RefractiveIndex
        onChange={handleRefractiveIndexChange}
        refractiveIndex={selectedElement?.refractiveIndex}
      />
    ),
    cauchyCoeffient: (
      <CauchyCoeffient
        onChange={handleCauchyCoeffientChange}
        cauchyCoeffient={selectedElement?.cauchyCoeffient || 0.004}
      />
    ),
    lens: (
        <Lens
            onChange={handleLensChange}
            curved={selectedElement?.curved}
            width={selectedElement?.width}
        />
    ),
    soloLight: (
        <SoloLight
            handleLightChange={handleLightChange}
            wavelength={selectedElement?.wavelength}
            brightness={selectedElement?.brightness * 100}
        />
    ),
  };

  if (selectedElement && selectedElement.properties) {
    return (
      <aside className="bg-backgroundGlass backdrop-blur-xl bottom-0 relative w-[280px] rounded-xl border p-4 pointer-events-auto">
        {selectedElement.properties.map((property, index) => (
          <section className="mb-4" key={index}>
            {components[property]}
          </section>
        ))}
      </aside>
    );
  }
};

export default Propertiesbar;

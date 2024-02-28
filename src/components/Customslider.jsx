import { Slider } from "./ui/slider";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Label } from "./ui/label";

const Customslider = ({
  onChange,
  min,
  max,
  name,
  description,
  value,
  defaultValue,
  step,
}) => {
  return (
    <section>
      <HoverCard openDelay={200}>
        <HoverCardTrigger className="mr-[70px] font-bold text-lg">
          <div className="flex items-center justify-between">
            <Label htmlFor={name}>{name}</Label>
            <span className="w-12 rounded-md border px-2 py-0.5 text-center text-sm text-muted-foreground font-normal">
              {value}
            </span>
          </div>
          <Slider
            id={name}
            className="mt-4"
            defaultValue={[defaultValue]}
            min={min}
            max={max}
            onValueChange={onChange}
            step={step || 1}
            aria-label="Wavelength"
          />
        </HoverCardTrigger>
        <HoverCardContent side="left">{description}</HoverCardContent>
      </HoverCard>
    </section>
  );
};

export default Customslider;

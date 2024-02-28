import {Slider} from "./ui/slider";
import {useEffect, useRef, useState} from "react";
import tinycolor from "tinycolor2";

const Colorpicker = ({onChange}) => {
    const max = 246;
    const canvasSpectrum = useRef(null);
    const cursorSpectrum = useRef(null);

    const [hueColor, setHue] = useState(10);
    const [value, setValue] = useState(max);
    const [saturation, setSaturation] = useState(max);
    const [actualColor, setActualColor] = useState("#ff2a00");

    function updateCursor(x, y) {
        cursorSpectrum.current.style.left = x + 'px';
        cursorSpectrum.current.style.top = y + 'px';

        setSaturation(x)
        setValue(max - y);
    }

    function createShadeSpectrum(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = tinycolor({h: hueColor, s: 1, v: 1}).toHslString();
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const saturationGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
        saturationGradient.addColorStop(0, "#fff");
        saturationGradient.addColorStop(1, "transparent");
        ctx.fillStyle = saturationGradient;
        ctx.fillRect(0, 0, ctx.canvas.width, canvasSpectrum.current.height);

        const valueGradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        valueGradient.addColorStop(0, "transparent");
        valueGradient.addColorStop(1, "#000");
        ctx.fillStyle = valueGradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    function getSpectrumColor(e, x, y, hue) {
        let xRatio = x / max;
        let yRatio = y / max;

        if (e) {
            e.preventDefault();

            const spectrumRect = e.currentTarget.colorPickerSpectrumRect;

            x = e.pageX - spectrumRect.left;
            y = e.pageY - spectrumRect.top;

            if(x > spectrumRect.width) x = spectrumRect.width
            if(x < 0) x = 0
            if(y > spectrumRect.height) y = spectrumRect.height
            if(y < 0) y = 0

            xRatio = x / spectrumRect.width;
            yRatio = y / spectrumRect.height;
        }
        if(!hue) hue = hueColor


        const color = tinycolor({h: hue, s: xRatio, v: 1 - yRatio});

        cursorSpectrum.current.style.backgroundColor = color.toHexString()
        cursorSpectrum.current.style.borderColor = color.isDark() ? '#fff' : '#000';

        setHue(hue)
        setActualColor(color.toHexString());
        interpolate(x, 650 - 250 / 270 * hue, 246 - y );
        updateCursor(x, y);
    }

    function interpolate(s, h, brightness) {
        const div = brightness / 246
        const constant = -7000;
        const n_min = 400, n_max = 650;
        const step = (n_max - n_min) / 9;
        const x = [];
        const y = [];
        s /= 10;

        for (let i = 0; i < 10; i++) {
            x.push(Math.round(n_min + step * i));
        }

        for (let i = 0; i < x.length; i++) {
            let n = -s * Math.pow((x[i] - h), 2);
            if (n > constant) {
                y.push(Math.abs(constant - n) / 70 * div);
            } else {
                y.push(0);
            }
        }

        onChange({wavelengths: x, brightness: y});
    }


    useEffect(() => {
        const canvas = canvasSpectrum.current;
        const ctx = canvas.getContext('2d');

        createShadeSpectrum(ctx);

        const handleMouseDown = e => {
            window.colorPickerSpectrumRect = canvas.getBoundingClientRect();
            canvas.colorPickerSpectrumRect = canvas.getBoundingClientRect();

            getSpectrumColor(e);
            window.addEventListener('mousemove', getSpectrumColor);
            window.addEventListener('mouseup', () => {window.removeEventListener('mousemove', getSpectrumColor)});
        }

        canvas.addEventListener('mousedown', handleMouseDown);

        return () => {
            window.removeEventListener('mousemove', getSpectrumColor);
            canvas.removeEventListener('mousedown', handleMouseDown);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hueColor]);

    return (
        <div>
            <div className="w-full h-[246px] relative overflow-hidden">
                <button className="absolute w-7 h-7 bg-transparent rounded-3xl border-2 border-white pointer-events-none ml-[-0.875rem] mt-[-0.875rem] left-[246px]" ref={cursorSpectrum} />
                <canvas className="w-full h-full bg-amber-300" id="spectrum" ref={canvasSpectrum}/>
            </div>
            <section className="mt-2">
                <Slider className="mt-4" defaultValue={[hueColor]} max={270} step={1} onValueChange={e => getSpectrumColor(null, saturation, max - value, e[0])}/>
                <Slider className="mt-4" defaultValue={[saturation]} max={max} step={1} value={[saturation]} onValueChange={e => getSpectrumColor(null, e[0], max - value)}/>
                <Slider className="mt-4" defaultValue={[value]} max={max} step={1} value={[value]} onValueChange={e => getSpectrumColor(null, saturation, max - e[0])}/>
            </section>
            <section className="flex mt-6">
                <span className="rounded-md border px-2 py-2 h-9 text-center text-sm w-full font-normal text-white">{actualColor}</span>
            </section>
        </div>
    );
}
export default Colorpicker;

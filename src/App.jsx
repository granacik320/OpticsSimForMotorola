import './css/App.css';
import Header from './components/Header';
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import Scene from "./simulator/Scene";
import Objectbar from "./components/Objectbar";
import Propertiesbar from "./components/Propertiesbar";

function App() {
    const sceneRef = useRef(null);

    const [actionChange, setAction] = useState({action: null, type: null});
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);

    useLayoutEffect(() => {
        sceneRef.current = new Scene(
            document.querySelector('.mainscene').clientWidth,
            document.querySelector('.mainscene').clientHeight,
            document.getElementById('canvas'),
            document.getElementById('light-canvas')
        );

        sceneRef.current.addEvent('elementsChange', () => setElements(sceneRef.current.elements));
        sceneRef.current.addEvent('targetChange', () => {
            setSelectedElement(sceneRef.current.elements.find(e => e.name === sceneRef.current.target?.name));
        });

    }, []);

    useEffect(() => {
        if (sceneRef.current) {
            sceneRef.current.action = actionChange.action;
            sceneRef.current.elementToCreate = actionChange.type;
        }
    }, [actionChange]);

    window.addEventListener('resize', () => {
        if (sceneRef.current) {
            sceneRef.current.resize(
                document.querySelector('.mainscene').clientWidth,
                document.querySelector('.mainscene').clientHeight
            );
        }
    });

    const handleLightChange = e => {
        if(e.wavelengths){
            sceneRef.current?.changeMulticolorCluster(e);
        }else{
            sceneRef.current?.changeCluster(e.parent, e.valueWavelength, e.valueBrightness);
        }
    }

    const handleLensChange = e => {
        sceneRef.current?.changeLens(e.name, e.curved, e.width);
    }

  return (
      <div className="App">
          <main className="flex w-full h-full p-2 z-10 absolute flex-col items-start pointer-events-none">
              <Header onActionChange={actionChange} setAction={setAction}/>
              <section className="flex flex-row justify-between w-full mt-2 h-full">
                  <Objectbar elements={elements} selectedElement={selectedElement} />
                  <Propertiesbar selectedElement={selectedElement} onChangeLight={handleLightChange} onChangeLens={handleLensChange} onChangeCauchyCoeffient={e => sceneRef.current?.changeCauchyCoeffient(e.name, e.cauchyCoeffient)} onChangeRefractiveIndex={(name, index) => sceneRef.current?.changeRefractiveIndex(name, index)}/>
              </section>
          </main>
          <div className="mainscene w-full h-screen bg-black">
              <canvas className="absolute" id="light-canvas"></canvas>
              <canvas className="absolute" id="canvas"></canvas>
          </div>
      </div>
  );
}

export default App;

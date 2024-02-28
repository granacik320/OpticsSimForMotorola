import {useEffect, useRef, useState} from "react";
import {IconCaretDown} from "@tabler/icons-react";

const Splitbutton = (props) => {
    const [isOpened, setOpened] = useState(false);
    const [selected, setSelected] = useState(props.categories[0]);
    const listRef = useRef(null);

    const handleClickOutside = (e) => {
        if (listRef.current && !listRef.current.contains(e.target)) {
            setOpened(false);
        }
    };

    const handleSelect = (e) => {
        setSelected(e)
        props.setActon({action: e.action, type: e.text.toLowerCase()})
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <span className={`x-split-button ${isOpened && "open"}`}>
            <button className="x-button x-button-main" onClick={() => props.setActon({action: selected.action, type: selected.text.toLowerCase()})}>{selected.icon}</button>
            <button className="x-button x-button-drop" onClick={() => setOpened(true)}><IconCaretDown stroke={1} size={12}/></button>
            <ul ref={listRef} className="x-button-drop-menu">{
                props.categories.map((e, i) =>
                    <li key={i} onClick={() => handleSelect(e)}>{e.icon}{e.text}</li>
                )
            }</ul>
        </span>
    )
}

export default Splitbutton;
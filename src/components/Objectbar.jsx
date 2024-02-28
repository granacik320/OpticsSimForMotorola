const Objectbar = ({elements}) => {
    const handleClick = (e) => {
      e.target.style.color = "red";
    }
  return (
    <aside className="bg-backgroundGlass backdrop-blur-xl bottom-0 relative w-[250px] rounded-xl border p-4 ">
      <div>
        <ul>
          {elements.map((element, index) => (
            <li className="rounded-md px-4 py-1 font-semibold" key={index} onClick={handleClick}>
              {element.name}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Objectbar;

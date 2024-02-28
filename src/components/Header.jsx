import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from "./ui/menubar"



const Header = ({setAction}) => {
    return (
            <Menubar className="pointer-events-auto">
                <MenubarMenu>
                    <MenubarTrigger>Tools</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onSelect={() => setAction({action: null, type: "pointer"})}>
                            Pointer <MenubarShortcut>⌘T</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Mirrors</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "arc"})}>
                            Arc <MenubarShortcut>⌘M</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "mirrorline"})}>MirrorLine</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Lens</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "circle"})}>Circle</MenubarItem>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "polygon"})}>Polygon</MenubarItem>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "rectangle"})}>Rectangle</MenubarItem>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "lens"})}>Lens</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Voids</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "voidcircle"})}>VoidCircle</MenubarItem>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "voidline"})}>VoidLine</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Lasers</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "laser"})}>Laser</MenubarItem>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "threesixty"})}>Threesixty</MenubarItem>
                        <MenubarItem onSelect={() => setAction({action: "creating", type: "bundle"})}>Bundle</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
    );
};

export default Header;


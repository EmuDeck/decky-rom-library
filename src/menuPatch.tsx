import { FooterLegendProps, afterPatch, findInReactTree } from "decky-frontend-lib";
import { getReactTree, routePath, routeStore } from "./init";
import { FC, ReactElement, ReactNode, useState } from "react";
import { PluginIcon, PluginIcon2 } from "./native-components/PluginIcon";
import { logN } from "./log";

interface MainMenuItemPropsBase {
  route: string;
  label: ReactNode;
  onFocus: () => void;
  icon?: ReactElement;
  onActivate?: () => void;
}

type MainMenuItemProps = MainMenuItemPropsBase & FooterLegendProps;

interface MenuItemWrapperProps extends MainMenuItemProps {
  MenuItemComponent: FC<MainMenuItemProps>;
  useIconAsProp: boolean;
}

export const patchMenu = (position: number) => {
  const menuNode = findInReactTree(getReactTree(), (node) => node?.memoizedProps?.navID == "MainNavMenuContainer");
  if (!menuNode || !menuNode.return?.type) {
    logN("Menu Patch", "Failed to find main menu root node.");
    return () => {};
  }
  const orig = menuNode.return.type;
  let patchedInnerMenu: any;
  const menuWrapper = (props: any) => {
    const ret = orig(props);
    if (!ret?.props?.children?.props?.children?.[0]?.type) {
      logN(
        "Menu Patch",
        "The main menu element could not be found at the expected location. Valve may have changed it."
      );
      return ret;
    }
    if (patchedInnerMenu) {
      ret.props.children.props.children[0].type = patchedInnerMenu;
    } else {
      afterPatch(ret.props.children.props.children[0], "type", (_: any, ret: any) => {
        const isMenuItemElt = (e: any) => e.props?.label && e.props.onFocus && e.props.route && e.type?.toString;
        const menuItems = findInReactTree(ret, (node) => Array.isArray(node) && node.some(isMenuItemElt)) as Array<any>;

        if (!menuItems) {
          logN("Could not find menu items to patch.");
          return ret;
        }

        const itemIndexes = getMenuItemIndexes(menuItems);
        const menuItem = menuItems.find(isMenuItemElt) as { props: MainMenuItemProps; type: () => ReactElement };

        const newItem = (
          <MenuItemWrapper
            key={"retrolibrary"}
            route={routePath}
            onFocus={menuItem.props.onFocus}
            label="Retro Library"
            useIconAsProp={!!menuItem.props.icon}
            MenuItemComponent={menuItem.type}>
            <PluginIcon />
          </MenuItemWrapper>
        );

        menuItems.splice(itemIndexes[position - 1], 0, newItem);

        return ret;
      });
      patchedInnerMenu = ret.props.children.props.children[0].type;
    }
    return ret;
  };
  menuNode.return.type = menuWrapper;
  if (menuNode.return.alternate) {
    menuNode.return.alternate.type = menuNode.return.type;
  }

  return () => {
    menuNode.return.type = orig;
    menuNode.return.alternate.type = menuNode.return.type;
  };
};

function getMenuItemIndexes(items: any[]) {
  return items.flatMap((item, index) => (item && item.$$typeof && item.type !== "div" ? index : []));
}

const MenuItemWrapper: FC<MenuItemWrapperProps> = ({ MenuItemComponent, label, useIconAsProp, ...props }) => {
  const [_, setState] = useState(false);

  props[useIconAsProp ? "icon" : "children"] = <PluginIcon />;

  return <MenuItemComponent label="Retro Library" {...props}></MenuItemComponent>;
};

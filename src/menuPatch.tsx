import { FooterLegendProps, afterPatch, findInReactTree } from "decky-frontend-lib";
import { reactTree, routePath } from "./init";
import { FC, useState } from "react";
import { PluginIcon } from "./native-components/PluginIcon";
import { logN } from "./log";

interface MainMenuItemProps extends FooterLegendProps {
  route: string;
  label: string;
  onFocus: () => void;
  onActivate?: () => void;
}

export const patchMenu = () => {
  const menuNode = findInReactTree(reactTree, (node) => node?.memoizedProps?.navID == "MainNavMenuContainer");
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
        if (!ret?.props?.children || !Array.isArray(ret?.props?.children)) {
          logN("Menu Patch", "Could not find menu items to patch.");
          return ret;
        }
        const itemIndexes = getMenuItemIndexes(ret.props.children);
        const menuItemElement = findInReactTree(ret.props.children, (x) =>
          x?.type?.toString()?.includes("exactRouteMatch:")
        );

        const newItem = (
          <MenuItemWrapper
            route={routePath}
            label="Roms Library"
            onFocus={menuItemElement.props.onFocus}
            MenuItemComponent={menuItemElement.type}
          />
        );

        ret.props.children.splice(itemIndexes[3 - 1], 0, newItem);

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

interface MenuItemWrapperProps extends MainMenuItemProps {
  MenuItemComponent: FC<MainMenuItemProps>;
}

const MenuItemWrapper: FC<MenuItemWrapperProps> = ({ MenuItemComponent, ...props }) => {
  const [_, setState] = useState(false);

  return <MenuItemComponent {...props}>{<PluginIcon />}</MenuItemComponent>;
};

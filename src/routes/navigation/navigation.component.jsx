import { Outlet } from "react-router-dom";

import { WrapScreenNav } from "../../components/wrap-screen/wrap-screen-nav.styles";

import {
  NavigationContainer,
  LogoContainer,
  NavLinks,
  NavLink,
} from "./navigation.styles";

const Navigation = () => {
  return (
    <>
      <NavigationContainer>
        <WrapScreenNav>
          <LogoContainer to="/">
            <div>Challenge</div>
          </LogoContainer>
          <NavLinks>
            <NavLink to="/">
              Home
            </NavLink>
            <NavLink to="/universities">
              Universities
            </NavLink>
            <NavLink to="/postal-Lookup">
              Postal Lookup
            </NavLink>
          </NavLinks>
        </WrapScreenNav>
      </NavigationContainer>
      <Outlet />
    </>
  );
};

export default Navigation;

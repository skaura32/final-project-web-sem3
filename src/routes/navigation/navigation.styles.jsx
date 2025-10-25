import styled from "styled-components";
import { Link } from "react-router-dom";

export const NavigationContainer = styled.div`
  height: 70px;
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: #242424;
`;

export const LogoContainer = styled(Link)`
  height: 100%;
  min-width: 170px;
  display: flex;
  align-items: center;
  justify-content: start;
  color: #ffffffab;
  text-transform: uppercase;

  @media (max-width: 600px) {
    display:none
  }
`;

export const Logo = styled(Link)`
  text-align: left;
  color: #ffffffab;
`

export const NavLinks = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 600px) {
    justify-content: center;
  }
`;

export const NavLink = styled(Link)`
  margin: 0px 15px;
  text-align:center;
  color: #ffffffab;
  text-transform: uppercase;
  cursor: pointer;

  @media (max-width: 400px) {
    font-size: 12px;
  }
`;


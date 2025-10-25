import styled from "styled-components";

export const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items:center;
  position: relative;
`;

export const DropdownToggle = styled.button`
  background-color: black;
  color: #ffffffab;
  border: 2px solid #feae1f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 10px 20px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s ease;
  width: ${(props) => props.width || "400px"};
  height: 50px;
  text-transform: uppercase;
  margin: 0 10px;

  &:hover {
    background-color: #feae1f;
    color: #100f10;
    cursor: pointer;
  }

  @media (max-width: 600px) {
    width: 320px;
  }
`;

export const DropdownMenu = styled.div`
  width: ${(props) => (props.widthDm) || "400px"};
  background-color: black;
  border: 2px solid #feae1f;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-height: 200px;
  overflow-y: auto;
  transition: all 0.3s ease;
  position: absolute;
  top: 100%;
  left: 0;
  margin: 0 10px;
  text-align: ${(props) => props.textAlign || "left"};

  @media (max-width: 600px) {
    width: 316px;
  }
`;

export const DropdownSearch = styled.input`
  margin: 10px 20px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 400;
  transition: all 0.3s ease;
  color: #ffffffab;
  background-color: black;
  text-align: ${(props) => props.textAlign || "left"};
  width: ${(props) => (props.widthDm) || "310px"};
  border: 2px solid #feae1f;
  border-radius: 4px;
  display: ${(props) => (props.display) || "block"};

  &:hover {
    color: #feae1f;
  }

  @media (max-width: 600px) {
    width: 230px;
  }
`

export const DropdownItem = styled.div`
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 400;
  transition: all 0.3s ease;
  color: #feae1f;

  &:hover {
    background-color: #feae1f;
    color: #100f10;
    cursor: pointer;
  }
`;

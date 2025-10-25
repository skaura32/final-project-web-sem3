import styled from "styled-components";

export const ButtonBase = styled.button`
  min-width: 140px;
  width: auto;
  height: 50px;
  letter-spacing: 0.5px;
  line-height: 50px;
  padding: 0 25px 0 25px;
  font-size: 15px;
  border: 2px solid #feae1f;
  background-color: black;
  color: #ffffffab;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  margin: 0 10px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #feae1f;
    color: #100f10;
    cursor: pointer;
  }

  @media (max-width: 600px) {
    width: 320px;
  }
`;

export const ButtonEdit = styled(ButtonBase)`
  border: 2px solid #4285f4;
  color: #ffffffab;

  &:hover {
    background-color: #4285f4;
    color: white;
  }

  @media (max-width: 600px) {
    width: 250px;
  }
`;

export const ButtonDelete = styled(ButtonBase)`
  border: 2px solid #FF0043;
  color: #ffffffab;

  &:hover {
    background-color: #FF0043;
    color: white;
  }

  @media (max-width: 600px) {
    width: 250px;
  }
`;
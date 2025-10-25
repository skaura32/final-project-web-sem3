import styled from "styled-components";

export const SearchInput = styled.input`
  border: 2px solid #feae1f;
  color: #ffffffab;
  width: 90%;
  height: 50px;
  text-align: center;
  font-size: 15px;
  text-transform: uppercase;
  margin: 20px;
  padding: 0 15px;
  display: inline-block;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  background: transparent;
  -webkit-appearance: textfield;
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:hover {
    color: #feae1f;
  }

  @media (max-width: 600px) {
    width: 285px;
  }
`;

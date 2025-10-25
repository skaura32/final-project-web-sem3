import styled from "styled-components";

export const StyledAlert = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: #2ecc71;
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
  z-index: 2;

  span {
    flex-grow: 1;
  }

  button {
    background-color: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 16px;
    margin-left: 10px;
    font-weight: bold;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

export default StyledAlert;

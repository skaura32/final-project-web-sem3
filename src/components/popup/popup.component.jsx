import React, { useEffect } from "react";
import StyledAlert from './popup.styles'

const Popup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <StyledAlert>
      <span>{message}</span>
      <button onClick={onClose}>X</button>
    </StyledAlert>
  );
};

export default Popup;

import React, { useState } from "react";
import {
  DropdownContainer,
  DropdownToggle,
  DropdownMenu,
  DropdownSearch,
  DropdownItem,
} from "./dropdown.styles";

const Dropdown = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [searchValue, setSearchValue] = useState("");
 console.log("myOptions",props)
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    setSearchValue("");
    props.onOptionSelected(option);
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const filteredOptions = props.options.filter((option ,index) =>
    option.name?option.name:String(index).toLowerCase().includes(searchValue.toLowerCase())
  );
  
  return (
    <>
      <DropdownContainer>
        <DropdownToggle onClick={toggleMenu} width={props.width}>
          {selectedOption ? selectedOption : "Select"}
        </DropdownToggle>
        {isOpen && (
          <DropdownMenu
            width={props.width}
            widthDm={props.widthDm}
            textAlign={props.textAlign}
          >
            <DropdownSearch
              type="text"
              placeholder="Search"
              display={props.display}
              value={searchValue}
              onChange={handleSearchChange}
            />
            {filteredOptions.map((option) => (
              <DropdownItem
                key={option}
                className="dropdown-item"
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </DropdownContainer>
    </>
  );
};

export default Dropdown;

import { SearchInput } from "./search-box.styles";

const SearchBox = ({ placeholder, onChangeHandler }) => {
  const handleChange = (event) => {
    const value = parseInt(event.target.value, 10);

    if (value >=0 && value <= 100) {
      onChangeHandler(event);
    } else {
      event.target.value = "";
      onChangeHandler(event)
    }
  };

  return (
    <SearchInput
      type="number"
      min="0"
      max="100"
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

export default SearchBox;

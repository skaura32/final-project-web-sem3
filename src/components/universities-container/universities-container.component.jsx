import React, { useState, useEffect } from "react";
import { fetchUniversities } from "../../store/universities/universitiesAction";
import { fetchCountries } from "../../store/countries/countriesAction";
import { connect } from "react-redux";
import Dropdown from "../dropdown/dropdown.component";
import {
  WrapContent,
  CardWrap,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardLink,
} from "./universities-container.styles";

const UniversitiesContainer = ({
  universitiesData,
  countriesData,
  fetchUniversities,
  fetchCountries,
}) => {
  const [selectedCountry, setSelectedCountry] = useState("");

  useEffect(() => {
    if (!countriesData.countries.length) {
      fetchCountries();
    }
    if (selectedCountry) {
      fetchUniversities(selectedCountry);
    }
  }, [selectedCountry]);

  const handleCountrySelected = (country) => {
    setSelectedCountry(country);
  };

  const sortProps = (countries) => {
    return countries.sort((a, b) => a.name.localeCompare(b.name));
  };
 
  return (
   
    <>
    <h2>Check the list of university</h2>
      <WrapContent>
        <Dropdown
          widthDm="396px"
          options={sortProps(countriesData.countries).map(
            (option) => (option)
          )}
          onOptionSelected={handleCountrySelected}
        />
        {selectedCountry ? (<p>Total found: {universitiesData.universities.length}</p>) : ''}
        {selectedCountry ? (
        <CardWrap>
          {universitiesData.universities.map((university) => (
            <Card key={university.name}>
              <CardHeader>
                <CardTitle>{university.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Website:{" "}
                  <CardLink
                    href={university.web_pages[0]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {university.web_pages[0]}
                  </CardLink>
                </p>
              </CardContent>
            </Card>
          ))}
        </CardWrap>
        ) : (
          <p>Select a country from the dropdown menu.</p>
        )}
      </WrapContent>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    universitiesData: state.universities,
    countriesData: state.countries,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUniversities: (selectedCountry) => {
      dispatch(fetchUniversities(selectedCountry));
    },
    fetchCountries: () => dispatch(fetchCountries()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UniversitiesContainer);

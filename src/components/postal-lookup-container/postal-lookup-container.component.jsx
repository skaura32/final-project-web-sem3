import React, { useState, useEffect } from "react";

import { fetchPostalLookup } from "../../store/postalLookup/postalLookupAction";
import { connect } from "react-redux";

import Button from "../button/button.component";
import Dropdown from "../dropdown/dropdown.component";
import InputComponent from "../input/input.component";

import {
  WrapInputContent,
  WrapInput,
  Card,
  Title,
  SubtitleHeading,
  Subtitle,
  Text,
} from "./postal-lookup-container.styles";

const PostalLookupContainer = ({ postalLookupData, fetchPostalLookup }) => {
  const [countryCode, setCountryCode]=useState('');
  const [postCode, setPostCode] = useState("");
  const [countryHint, setCountryHint] = useState("");
  const [handlePostalLookupSearch, setHandlePostalLookupSearch] =
    useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (countryCode && postCode) {
      fetchPostalLookup(countryCode, postCode);
      setShowContent(true);
    }
  }, [handlePostalLookupSearch, fetchPostalLookup]);

  const handleCountrySelected = (country) => {
    setCountryCode(country);
    switch (country) {
      case "CA":
        setCountryHint("Enter a postal code from A0A to Y1A");
        break;
      case "US":
        setCountryHint("Enter a postal code from 00210 to 99950");
        break;
      case "MX":
        setCountryHint("Enter a postal code from 01000 to 99998");
        break;
      case "BR":
        setCountryHint("Enter a postal code from 01000-000 to 99990-000");
        break;
      default:
        setCountryHint("");
        break;
    }
  };

  const onPostalCodeChange = (event) => {
    const fieldPostalCode = event.target.value;
    setPostCode(fieldPostalCode);
  };

  return (
    <>
      <h2>Select the country and enter the postal code</h2>
      <WrapInputContent>
        <WrapInput>
          <Dropdown
            options={["CA", "US", "MX", "BR"]}
            width="140px"
            widthDm="136px"
            textAlign="center"
            display="none"
            onOptionSelected={handleCountrySelected}
          ></Dropdown>
          <InputComponent
            onChangeHandler={onPostalCodeChange}
            placeholder="Postal Code"
          ></InputComponent>

          <Button
            onClick={() =>
              setHandlePostalLookupSearch(!handlePostalLookupSearch)
            }
          >
            Search
          </Button>
        </WrapInput>
        <p>{countryHint}</p>
        {showContent && postalLookupData.error && (
          <p>There are no addresses with this postal code</p>
        )}
      </WrapInputContent>

      {showContent || postalLookupData.postalLookup.country && (
        <Card>
          <Title>
            {postalLookupData.postalLookup.country}{" "}
            <span>
              {postalLookupData?.postalLookup["country abbreviation"]}
            </span>
          </Title>
          <div>
            <SubtitleHeading>
              {postalLookupData?.postalLookup["post code"]}
            </SubtitleHeading>

            <Subtitle>
              Place name:{" "}
              <Text>
                {postalLookupData?.postalLookup?.places?.[0]["place name"]}
              </Text>
            </Subtitle>

            <Subtitle>
              State:{" "}
              <Text>
                {postalLookupData?.postalLookup?.places?.[0].state}{" "}
                <span>
                  {
                    postalLookupData?.postalLookup?.places?.[0][
                      "state abbreviation"
                    ]
                  }
                </span>
              </Text>
            </Subtitle>

            <Subtitle>
              Latitude:{" "}
              <Text>
                {postalLookupData?.postalLookup?.places?.[0]?.latitude}
              </Text>
            </Subtitle>

            <Subtitle>
              Longitude:{" "}
              <Text>
                {postalLookupData?.postalLookup?.places?.[0]?.longitude}
              </Text>
            </Subtitle>
          </div>
        </Card>
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    postalLookupData: state.postalLookup,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPostalLookup: (countryCode, postCode) => {
      dispatch(fetchPostalLookup(countryCode, postCode));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostalLookupContainer);

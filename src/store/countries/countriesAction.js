import axios from "axios";
import {
  FETCH_COUNTRIES_REQUEST,
  FETCH_COUNTRIES_SUCCESS,
  FETCH_COUNTRIES_FAILURE,
} from "./countriesTypes";

export const fetchCountries = () => async (dispatch) => {
  try {
    dispatch(fetchCountriesRequest());

    const response = await axios.get(
      "https://countriesnow.space/api/v0.1/countries/info?returns=none"
    );
    const countries = response.data.data;

    dispatch(fetchCountriesSuccess(countries));
  } catch (error) {
    dispatch(fetchCountriesFailure(error.message));
  }
};

const fetchCountriesRequest = () => ({
  type: FETCH_COUNTRIES_REQUEST,
});

const fetchCountriesSuccess = (countries) => ({
  type: FETCH_COUNTRIES_SUCCESS,
  payload: countries,
});

const fetchCountriesFailure = (error) => ({
  type: FETCH_COUNTRIES_FAILURE,
  payload: error,
});

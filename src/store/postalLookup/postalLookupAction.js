import axios from "axios";
import {
  FETCH_POSTALLOOKUP_REQUEST,
  FETCH_POSTALLOOKUP_SUCCESS,
  FETCH_POSTALLOOKUP_FAILURE,
} from "./postalLookupTypes";

export const fetchPostalLookup =
  (countryCode, postCode) => async (dispatch) => {
    dispatch(fetchPostalLookupRequest());
    try {
      const response = await axios.get(
        `https://api.zippopotam.us/${countryCode}/${postCode}`
      );
      const postalLookup = response.data;
      dispatch(fetchPostalLookupSuccess(postalLookup));
    } catch (error) {
      dispatch(fetchPostalLookupFailure(error.message));
    }
  };

const fetchPostalLookupRequest = () => ({
  type: FETCH_POSTALLOOKUP_REQUEST,
});

const fetchPostalLookupSuccess = (postalLookup) => ({
  type: FETCH_POSTALLOOKUP_SUCCESS,
  payload: postalLookup,
});

const fetchPostalLookupFailure = (error) => ({
  type: FETCH_POSTALLOOKUP_FAILURE,
  payload: error,
});

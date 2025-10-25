import axios from "axios";
import {
  FETCH_UNIVERSITIES_REQUEST,
  FETCH_UNIVERSITIES_SUCCESS,
  FETCH_UNIVERSITIES_FAILURE,
} from "./universitiesTypes";

export const fetchUniversities =
  (selectedCountry = "") =>
  async (dispatch) => {
    dispatch(fetchUniversitiesRequest());
    try {
      const response = await axios.get(
        `http://universities.hipolabs.com/search?country=${selectedCountry}`
      );
      const universities = response.data;
      dispatch(fetchUniversitiesSuccess(universities));
    } catch (error) {
      dispatch(fetchUniversitiesFailure(error.message));
    }
  };

const fetchUniversitiesRequest = () => ({
  type: FETCH_UNIVERSITIES_REQUEST,
});

const fetchUniversitiesSuccess = (universities) => ({
  type: FETCH_UNIVERSITIES_SUCCESS,
  payload: universities,
});

const fetchUniversitiesFailure = (error) => ({
  type: FETCH_UNIVERSITIES_FAILURE,
  payload: error,
});

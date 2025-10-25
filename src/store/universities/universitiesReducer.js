import {
    FETCH_UNIVERSITIES_REQUEST,
    FETCH_UNIVERSITIES_SUCCESS,
    FETCH_UNIVERSITIES_FAILURE,
  } from "./universitiesTypes";
  
  const initialState = {
    loading: false,
    universities: [],
    error: "",
  };
  
  const universitiesReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_UNIVERSITIES_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case FETCH_UNIVERSITIES_SUCCESS:
        return {
          loading: false,
          universities: action.payload,
          error: "",
        };
      case FETCH_UNIVERSITIES_FAILURE:
        return {
          loading: false,
          universities: [],
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default universitiesReducer;
  
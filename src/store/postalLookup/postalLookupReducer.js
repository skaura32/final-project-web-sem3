import {
    FETCH_POSTALLOOKUP_REQUEST,
    FETCH_POSTALLOOKUP_SUCCESS,
    FETCH_POSTALLOOKUP_FAILURE,
  } from "./postalLookupTypes";
  
  const initialState = {
    loading: false,
    postalLookup: [],
    error: "",
  };
  
  const postalLookupReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_POSTALLOOKUP_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case FETCH_POSTALLOOKUP_SUCCESS:
        return {
          loading: false,
          postalLookup: action.payload,
          error: "",
        };
      case FETCH_POSTALLOOKUP_FAILURE:
        return {
          loading: false,
          postalLookup: [],
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default postalLookupReducer;
  
import { combineReducers } from "redux";
import postsReducer from "./posts/postsReducer";
import universitiesReducer from "./universities/universitiesReducer";
import countriesReducer from "./countries/countriesReducer";
import postalLookupReducer from "./postalLookup/postalLookupReducer"

const rootReducer = combineReducers({
  posts: postsReducer,
  universities: universitiesReducer,
  countries: countriesReducer,
  postalLookup: postalLookupReducer,
});

export default rootReducer;

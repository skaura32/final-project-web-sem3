import axios from "axios";
import {
  FETCH_POSTS_REQUEST,
  FETCH_POSTS_SUCCESS,
  FETCH_POSTS_FAILURE,
} from "./postsTypes";

export const fetchPosts = (searchField) => async (dispatch) => {
  dispatch(fetchPostsRequest());

  try {
    const response = await axios.get(
      `https://jsonplaceholder.typicode.com/posts${
        searchField ? `/${searchField}` : "?_start=0&_limit=20"
      }`
    );
    const posts = searchField ? [response.data] : response.data;
    dispatch(fetchPostsSuccess(posts));
  } catch (error) {
    dispatch(fetchPostsFailure(error.message));
  }
};

export const fetchPostsRequest = () => ({
  type: FETCH_POSTS_REQUEST,
});

export const fetchPostsSuccess = (posts) => ({
  type: FETCH_POSTS_SUCCESS,
  payload: posts,
});

export const fetchPostsFailure = (error) => ({
  type: FETCH_POSTS_FAILURE,
  payload: error,
});

export const handlePostSubmit = async (postData, setLoading, setModalOpen, setShowSuccess) => {
  setLoading(true);
  const url = "https://jsonplaceholder.typicode.com/posts";

  try {
    const response = await axios.post(url, postData);
    console.log(`Vog Q2 - API Post id: ${response.data.id}`, response);
    setShowSuccess(true)
  } catch (error) {
    console.error("Vog Q2 - API Post: ", error);
  } finally {
    setLoading(false);
    setModalOpen(false);
  }
};

export const handlePostDelete = async (id, setLoading, setShowSuccess) => {
  setLoading(true);
  const url = `https://jsonplaceholder.typicode.com/posts/${id}`;

  try {
    const response = await axios.delete(url);
    console.log(`Vog Q2 - API Delete id: ${id}`, response);
    setShowSuccess(true)
  } catch (error) {
    console.error("Vog Q2 - API Delete: ", error);
  } finally {
    setLoading(false);
  }
};

export const handleEditSubmit = async (
  id,
  title,
  body,
  userId,
  setLoading,
  setModalOpen,
  setShowSuccess
) => {
  setLoading(true);
  const url = `https://jsonplaceholder.typicode.com/posts/${id}`;

  try {
    const response = await axios.put(url, {
      id,
      title,
      body,
      userId,
    });
    console.log(`Vog Q2 - API PUT id: ${response.data.id}`, response);
    setShowSuccess(true)
  } catch (error) {
    console.error("Vog Q2 - API PUT: ", error);
  } finally {
    setLoading(false);
    setModalOpen(false);

  }
};

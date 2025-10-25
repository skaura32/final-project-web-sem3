import React, { useState, useEffect,  } from "react";

import { fetchPosts } from "../../store/posts/postsActions";
import { handlePostSubmit } from "../../store/posts/postsActions";
import { connect } from "react-redux";
import Modal from "react-modal";
import PostModal from "../modal/modal.component";
import Button from "../button/button.component";
import CardList from "../card-list/card-list.component";
import SearchBox from "../search-box/search-box.component";
import { Container } from "./posts-container.styles";
import Popup from "../popup/popup.component";

const PostsContainer = ({ postsData, fetchPosts }) => {
  const [searchField, setSearchField] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [conditionFilteredPosts, setConditionFilteredPosts] = useState(false);

  useEffect(() => {
    fetchPosts(searchField);
  }, [fetchPosts, searchField]);

  useEffect(() => {
    if(!conditionFilteredPosts){
      setFilteredPosts(postsData.posts)
       setConditionFilteredPosts(true)
    }
   
  }, [searchField]);

  const onSearchChange = (event) => {
    const searchFieldString = event.target.value;
    setSearchField(searchFieldString);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = (postData) => {
    handlePostSubmit(postData, setLoading, setModalOpen, setShowSuccess);
  };

  const handleFilterDeletedPost = (id) => {
    const filteredPosts = postsData.posts.filter(post => post.id !== id);
    setFilteredPosts(filteredPosts);
  }

  return (
    <>
    <h2>Search your post, edit, delete, add</h2>
      <Container>
        <SearchBox
          onChangeHandler={onSearchChange}
          placeholder="Search by id"
        />
        <Button onClick={handleOpenModal} disabled={loading}>
          Add post
        </Button>
      </Container>

      <Modal
        isOpen={modalOpen}
        onRequestClose={handleCloseModal}
        ariaHideApp={false}
      >
        <PostModal
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          textHeading={"Add Post"}
        />
      </Modal>
      {showSuccess && <Popup message="Action Done!" onClose={() => setShowSuccess(false)} />}
      <CardList posts={filteredPosts} setShowSuccess={setShowSuccess} handleFilterDeletedPost={handleFilterDeletedPost}/>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    postsData: state.posts,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPosts: (searchField) => dispatch(fetchPosts(searchField)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PostsContainer);

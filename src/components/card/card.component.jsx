import { useState } from "react";
import Modal from "react-modal";
import PostModal from "../modal/modal.component";
import Button from "../button/button.component";
import { handleEditSubmit } from "../../store/posts/postsActions";
import { handlePostDelete } from "../../store/posts/postsActions";

import {
  CardWrapper,
  CardHeading,
  CardTitle,
  CardId,
  CardText,
  CardBottom,
} from "./card.styles";

const Card = ({ post, setShowSuccess, handleFilterDeletedPost}) => {
  const { id, title, body, userId } = post;

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = () => {
    handleEditSubmit(id, title, body, userId, setLoading, setModalOpen, setShowSuccess);
  };

  const handleDelete = () => {
    handlePostDelete(id, setLoading, setShowSuccess)
    handleFilterDeletedPost(id)
  }

  return (
    <>
      <CardWrapper>
        <CardHeading>
          <CardId>{id}</CardId>#<CardTitle>{title}</CardTitle>
        </CardHeading>

        <img alt={`img ${id}`} src={`https://picsum.photos/500?random=${id}`} />
        <CardText>{body}</CardText>

        <CardBottom>
          <Button
            buttonType="edit"
            onClick={handleOpenModal}
            disabled={loading}
          >
            Edit
          </Button>
          <Button buttonType="delete" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>

        </CardBottom>
      </CardWrapper>

      <Modal
        isOpen={modalOpen}
        onRequestClose={handleCloseModal}
        ariaHideApp={false}
      >
        <PostModal
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          textHeading={`Edit Post ${id}`}
          editTitle={title}
          editBody={body}
          editUserId={userId}
        />
      </Modal>
    </>
  );
};

export default Card;

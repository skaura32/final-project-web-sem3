import { useState } from "react";

import {
  ModalOverlay,
  Modal,
  ModalContent,
  ModalButtons,
} from "./modal.styles";

const PostModal = ({
  onClose,
  onSubmit,
  textHeading,
  editTitle,
  editUserId,
  editBody,
}) => {
  editTitle = editTitle === undefined ? "" : editTitle;
  editUserId = editUserId === undefined ? "" : editUserId;
  editBody = editBody === undefined ? "" : editBody;

  const [title, setTitle] = useState(editTitle);
  const [userId, setUserId] = useState(editUserId);
  const [body, setContent] = useState(editBody);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ editTitle, editBody });
    onClose();
  };

  return (
    <>
      <ModalOverlay>
        <Modal>
          <ModalContent>
            <h2>{textHeading}</h2>

            <form onSubmit={handleSubmit}>
              <label htmlFor="title">UserId:</label>
              <input
                type="text"
                id="user-id"
                name="user-id"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              />

              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />

              <label htmlFor="content">Text:</label>
              <textarea
                id="content"
                name="content"
                value={body}
                onChange={(event) => setContent(event.target.value)}
              />

              <ModalButtons>
                <button type="submit">Submit</button>
                <button type="button" onClick={onClose}>
                  Cancel
                </button>
              </ModalButtons>
            </form>
          </ModalContent>
        </Modal>
      </ModalOverlay>
    </>
  );
};

export default PostModal;

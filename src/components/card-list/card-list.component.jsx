import Card from "../card/card.component";
import Posts from "./card-list.styled";

const CardList = ({ posts, setShowSuccess, handleFilterDeletedPost }) => (
  <Posts>
    {posts.map((post) => {
      return <Card key={post.id} post={post} setShowSuccess={setShowSuccess} handleFilterDeletedPost={handleFilterDeletedPost}/>;
    })}
  </Posts>
);

export default CardList;

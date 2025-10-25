import { WrapScreenContent } from "../../components/wrap-screen/wrap-screen-content.styles";

import PostsContainer from "../../components/posts-container/posts-container.component";

const Home = () => {
  return (
    <WrapScreenContent>
      <PostsContainer />
    </WrapScreenContent>
  );
};

export default Home
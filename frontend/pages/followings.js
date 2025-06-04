import FollowList from '../components/FollowList';

const FollowingPage = () => {
  return (
    <div>
      <h2>내 팔로잉</h2>
      <FollowList type="followings" />
    </div>
  );
};

export default FollowingPage;

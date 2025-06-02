import FollowList from '../components/FollowList';

const FollowerPage= () => {
  return (
    <div>
      <h2>내 팔로워</h2>
      <FollowList type="followers" />
    </div>
  );
};

export default FollowerPage;

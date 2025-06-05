import React from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import AppLayout from '../../components/AppLayout';
import PostForm from '../../components/PostForm';

const EditPostPage = () => {
  const router = useRouter();
  const { postId } = router.query;
  const { mainPosts } = useSelector(state => state.post_IN);
  const post = mainPosts.find(p => String(p.id) === String(postId));

  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;
  return (
    <AppLayout>
      <PostForm editMode={true} originPost={post} />
    </AppLayout>
  );
};

export default EditPostPage;

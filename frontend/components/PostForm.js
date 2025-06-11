import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Form, Input, Button, Switch, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  ADD_POST_REQUEST, ADD_POST_RESET,
  EDIT_POST_REQUEST, EDIT_POST_RESET,
  UPLOAD_IMAGES_REQUEST,
  REMOVE_IMAGE, RESET_IMAGE_PATHS
} from '../reducers/post_IN';
import { useRouter } from 'next/router';
import MentionInput from '../components/MentionInput';
import MentionTextArea from '../components/MentionTextArea';

const PostForm = ({ editMode = false, originPost }) => {
  const dispatch = useDispatch();
  const {
    imagePaths,
    addPostLoading, addPostDone,
    uploadImagesLoading,
    editPostLoading, editPostDone
  } = useSelector(state => state.post_IN);
  const router = useRouter();

  const imageInput = useRef();

  const [receiverId, setReceiverId] = useState(null);

  // 기존 이미지(수정모드)
  const [oldImages, setOldImages] = useState(
    editMode && originPost && Array.isArray(originPost.Images)
      ? originPost.Images.map(img => img.src)
      : []
  );
  const [content, setContent] = useState(editMode && originPost ? originPost.content : '');
  // **여기!**
  const [private_post, setPrivatePost] = useState(
    editMode && originPost ? !!originPost.private_post : false
  );

  // 글 작성/수정 성공시 폼 리셋
  useEffect(() => {
    if (addPostDone && !editMode) {
      message.success('게시글이 성공적으로 등록되었습니다!');
      setContent('');
      setOldImages([]);
      dispatch({ type: ADD_POST_RESET });
      router.push('/');
    }
    if (editPostDone && editMode) {
      message.success('게시글이 성공적으로 수정되었습니다!');
      dispatch({ type: EDIT_POST_RESET });
      router.push('/');
    }
  }, [addPostDone, editPostDone, dispatch, editMode, router]);

  // originPost 바뀌면 값 동기화
  useEffect(() => {
    if (editMode && originPost) {
      setContent(originPost.content || '');
      setOldImages(Array.isArray(originPost.Images) ? originPost.Images.map(img => img.src) : []);
      setPrivatePost(!!originPost.private_post); // 여기!
      dispatch({ type: RESET_IMAGE_PATHS });
    }
  }, [editMode, originPost, dispatch]);

  const onChangeContent = useCallback(e => setContent(e.target.value), []);
  const onClickImageUpload = useCallback(() => imageInput.current.click(), []);
  const onChangeImages = useCallback((e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach(f => formData.append('image', f));
    dispatch({ type: UPLOAD_IMAGES_REQUEST, data: formData });
    e.target.value = '';
  }, [dispatch]);
  const onRemoveImage = useCallback(index => dispatch({ type: REMOVE_IMAGE, index }), [dispatch]);
  const onRemoveOldImage = idx => setOldImages(prev => prev.filter((_, i) => i !== idx));
  // 공개범위 토글
  const onTogglePrivate = useCallback(checked => setPrivatePost(!checked), []);

  const onSubmit = useCallback(() => {
    if (!content.trim()) return message.warning('내용을 입력해주세요!');

    if (editMode) {
      // 순서 유지하면서 중복 제거 (oldImages 앞, imagePaths 뒤)
      const combinedImages = [...oldImages, ...imagePaths];
      const uniqueImages = combinedImages.filter((img, idx) => combinedImages.indexOf(img) === idx);

      dispatch({
        type: EDIT_POST_REQUEST,
        data: {
          postId: originPost.id,
          content,
          images: uniqueImages,
          private_post, // 여기!
          receiver_id: receiverId,
        },
      });
    } else {
      dispatch({
        type: ADD_POST_REQUEST,
        data: {
          content,
          images: imagePaths,
          private_post, // 여기!
          receiver_id: receiverId,
        },
      });
    }
  }, [content, imagePaths, private_post, dispatch, editMode, oldImages, originPost]);

  return (
    <Form layout="vertical" style={{ padding: 24, background: '#fff', borderRadius: 8 }}
      encType="multipart/form-data" onFinish={onSubmit}>
      <Form.Item label="게시글 내용" required>
  <MentionTextArea
    value={content}
    onChange={(e) => setContent(e.target.value)}
    onMentionSelect={(user) => {
      console.log('선택한 유저:', user);
      setReceiverId(user.id);
      // 나중에 receiver_id 상태 저장하기
    }}
  />
</Form.Item>
      <Form.Item label="이미지 업로드">
        <input type="file" multiple hidden ref={imageInput} onChange={onChangeImages} accept="image/*" />
        <Button onClick={onClickImageUpload} loading={uploadImagesLoading}>이미지 선택</Button>
      </Form.Item>
      {/* 기존 이미지(삭제 가능) */}
      {editMode && oldImages.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {oldImages.map((src, idx) => (
            <div key={src} style={{ marginBottom: 8 }}>
              <img src={`http://localhost:3065/uploads/post/${src}`} alt="기존이미지"
                style={{ width: '200px', borderRadius: 4 }} />
              <Button danger onClick={() => onRemoveOldImage(idx)}>삭제</Button>
            </div>
          ))}
        </div>
      )}
      {/* 업로드 성공시 서버 이미지(삭제 가능) */}
      {imagePaths.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {imagePaths.map((src, idx) => (
            <div key={src} style={{ marginBottom: 8 }}>
              <img src={`http://localhost:3065/uploads/post/${src}`} alt="업로드완료"
                style={{ width: '200px', borderRadius: 4 }} />
              <Button danger onClick={() => onRemoveImage(idx)}>삭제</Button>
            </div>
          ))}
        </div>
      )}
      <Form.Item label="공개 설정">
        <Switch
          checked={!private_post}
          onChange={onTogglePrivate}
          checkedChildren="전체공개"
          unCheckedChildren="나만보기"
        />
        <span style={{ marginLeft: 12 }}>
          {private_post ? '나만보기' : '전체공개'}
        </span>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit"
          loading={editMode ? editPostLoading : addPostLoading}>
          {editMode ? '수정하기' : '게시하기'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PostForm;

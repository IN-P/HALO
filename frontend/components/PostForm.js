// components/PostForm.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Form, Input, Button, Switch, Typography, Card, Space, message, Steps
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  ADD_POST_REQUEST, ADD_POST_RESET,
  EDIT_POST_REQUEST, EDIT_POST_RESET,
  UPLOAD_POST_IMAGES_REQUEST,
  REMOVE_IMAGE, RESET_IMAGE_PATHS
} from '../reducers/post_IN';
import SelectMapModal from './SelectMapModal';
import MentionTextArea from './MentionTextArea';
import ImageUploadCarousel from './ImageUploadCarousel';

const { Title, Text } = Typography;
const { Step } = Steps;

const parseMentions = (text) => {
  const mentionRegex = /@([^\s@]+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]); // nickname만 뽑음
  }
  return mentions;
};

const PostForm = ({ editMode = false, originPost }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    imagePaths, addPostLoading, addPostDone,
    uploadImagesLoading, editPostLoading, editPostDone
  } = useSelector(state => state.post_IN);

  const imageInput = useRef();

  const [oldImages, setOldImages] = useState(editMode && originPost?.Images ? originPost.Images.map(img => img.src) : []);
  const [content, setContent] = useState(editMode && originPost ? originPost.content : '');
  const [private_post, setPrivatePost] = useState(editMode && originPost ? !!originPost.private_post : false);
  const [showLocation, setShowLocation] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [location, setLocation] = useState(editMode && originPost ? originPost.location || '' : '');
  const [latitude, setLatitude] = useState(editMode && originPost ? originPost.latitude || '' : '');
  const [longitude, setLongitude] = useState(editMode && originPost ? originPost.longitude || '' : '');

  useEffect(() => {
    if (addPostDone && !editMode) {
      message.success('게시글이 등록되었습니다!');
      setContent('');
      setOldImages([]);
      setLocation('');
      setLatitude('');
      setLongitude('');
      setShowLocation(false);
      dispatch({ type: ADD_POST_RESET });
      router.push('/');
    }
    if (editPostDone && editMode) {
      message.success('게시글이 수정되었습니다!');
      dispatch({ type: EDIT_POST_RESET });
      router.push('/');
    }
  }, [addPostDone, editPostDone, editMode, router, dispatch]);

  useEffect(() => {
    if (editMode && originPost) {
      setContent(originPost.content || '');
      setOldImages(originPost.Images?.map(img => img.src) || []);
      setPrivatePost(!!originPost.private_post);
      setLocation(originPost.location || '');
      setLatitude(originPost.latitude || '');
      setLongitude(originPost.longitude || '');
      dispatch({ type: RESET_IMAGE_PATHS });
      setShowLocation(!!originPost.location);
    }
  }, [editMode, originPost, dispatch]);

  const onChangeContent = useCallback(e => setContent(e.target.value), []);
  const onClickImageUpload = useCallback(() => imageInput.current.click(), []);
  const onChangeImages = useCallback((e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();
    files.forEach(f => formData.append('image', f));
    dispatch({ type: UPLOAD_POST_IMAGES_REQUEST, data: formData });
    e.target.value = '';
  }, [dispatch]);
  const onRemoveImage = useCallback(index => dispatch({ type: REMOVE_IMAGE, index }), [dispatch]);
  const onRemoveOldImage = idx => setOldImages(prev => prev.filter((_, i) => i !== idx));
  const onTogglePrivate = useCallback(() => setPrivatePost(prev => !prev), []);

  const onSubmit = useCallback(() => {
    if (!content.trim()) return message.warning('내용을 입력해주세요!');
    if (showLocation && (!location || !latitude || !longitude)) {
      return message.warning('위치를 선택해주세요!');
    }

    const mentions = parseMentions(content);

    const payload = {
      ...(editMode && { postId: originPost.id }),
      content,
      mentions,
      images: [...oldImages, ...imagePaths].filter((img, idx, arr) => arr.indexOf(img) === idx),
      private_post,
      location: showLocation ? location : null,
      latitude: showLocation ? latitude : null,
      longitude: showLocation ? longitude : null,
    };

    dispatch({
      type: editMode ? EDIT_POST_REQUEST : ADD_POST_REQUEST,
      data: payload,
    });
  }, [content, imagePaths, oldImages, private_post, dispatch, editMode, originPost, showLocation, location, latitude, longitude]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: 700, margin: '0 auto', padding: '32px 16px' }}
    >
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
        <Title level={3}>{editMode ? '게시글 수정' : '새 게시글 작성'}</Title>

        <Steps current={0} size="small" style={{ marginBottom: 24 }}>
          <Step title="작성 중" />
          <Step title="등록 완료" />
        </Steps>

        <Form layout="vertical" onFinish={onSubmit} encType="multipart/form-data">
          <Form.Item label="📄 게시글 내용" required>
            <MentionTextArea
              value={content}
              onChange={onChangeContent}
              style={{
                borderRadius: 8,
                borderColor: '#d9d9d9',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'border 0.3s, box-shadow 0.3s'
              }}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #91d5ff')}
              onBlur={(e) => (e.target.style.boxShadow = '')}
            />
          </Form.Item>

          <Form.Item label="이미지 업로드">
            <input type="file" multiple hidden ref={imageInput} onChange={onChangeImages} accept="image/*" />
            <Button onClick={onClickImageUpload} loading={uploadImagesLoading} type="dashed">
              이미지 선택
            </Button>
          </Form.Item>

          {editMode && oldImages.length > 0 && (
            <Form.Item label="기존 이미지">
              <ImageUploadCarousel images={oldImages} onRemove={onRemoveOldImage} />
            </Form.Item>
          )}

          {imagePaths.length > 0 && (
            <Form.Item label="업로드한 이미지">
              <ImageUploadCarousel images={imagePaths} onRemove={onRemoveImage} />
            </Form.Item>
          )}

          <Form.Item label="위치 정보 추가">
            <Switch checked={showLocation} onChange={(checked) => {
              setShowLocation(checked);
              if (!checked) {
                setLocation('');
                setLatitude('');
                setLongitude('');
              }
            }} />
            <Text style={{ marginLeft: 12 }}>
              {showLocation ? '위치 입력 중' : '입력 안함'}
            </Text>
          </Form.Item>

          {showLocation && (
            <Card title="📍 선택된 위치" size="small" style={{ backgroundColor: '#fafafa', borderRadius: 10, marginBottom: 16 }}>
              <Button type="primary" onClick={() => setMapModalOpen(true)}>지도에서 위치 선택</Button>
              <Input value={location} readOnly style={{ marginTop: 12 }} />
              <Text type="secondary">위도: {latitude} / 경도: {longitude}</Text>
              <SelectMapModal
                visible={mapModalOpen}
                onClose={() => setMapModalOpen(false)}
                onSelect={({ address, latitude, longitude }) => {
                  setLocation(address);
                  setLatitude(latitude);
                  setLongitude(longitude);
                  setMapModalOpen(false);
                }}
              />
            </Card>
          )}

          <Form.Item label="공개 범위">
            <Space>
              <Switch
                checked={!private_post}
                onChange={onTogglePrivate}
                checkedChildren="🌐 공개"
                unCheckedChildren="🔒 비공개"
              />
              <Text type={private_post ? 'danger' : 'success'}>
                {private_post ? '현재 비공개 중입니다' : '전체 공개 중입니다'}
              </Text>
            </Space>
          </Form.Item>

          <Form.Item>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button type="primary" htmlType="submit" block loading={editMode ? editPostLoading : addPostLoading}>
                {editMode ? '게시글 수정' : '게시글 등록'}
              </Button>
            </motion.div>
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
              {editMode ? '수정된 내용은 즉시 반영됩니다.' : '등록 후 피드에서 바로 확인할 수 있어요.'}
            </Text>
          </Form.Item>
        </Form>
      </Card>
    </motion.section>
  );
};

export default PostForm;
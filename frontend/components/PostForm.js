import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Form, Input, Button, Switch, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ADD_POST_REQUEST, 
  UPLOAD_IMAGES_REQUEST, 
  REMOVE_IMAGE 
} from '../reducers/post_IN';

const PostForm = () => {
  const dispatch = useDispatch();
  const { imagePaths, addPostLoading, addPostDone, uploadImagesLoading } = useSelector(state => state.post_IN);
  
  const imageInput = useRef();
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // 미리보기용 프론트 상태
  const [previewImages, setPreviewImages] = useState([]);

  // 업로드 성공 시 프론트 미리보기 초기화, 글 작성 성공 시 텍스트 초기화
  useEffect(() => {
    if (imagePaths.length > 0) setPreviewImages([]);
  }, [imagePaths]);
  useEffect(() => {
    if (addPostDone) {
      message.success('게시글이 성공적으로 등록되었습니다!');
      setContent('');
    }
  }, [addPostDone]);

  const onChangeContent = useCallback((e) => {
    setContent(e.target.value);
  }, []);

  const onClickImageUpload = useCallback(() => {
    imageInput.current.click();
  }, []);

  const onChangeImages = useCallback((e) => {
    const files = Array.from(e.target.files);

    // 1. 프론트 미리보기
    setPreviewImages(files.map(file => URL.createObjectURL(file)));

    // 2. 서버로 실제 업로드
    const formData = new FormData();
    files.forEach((f) => formData.append('image', f));
    dispatch({
      type: UPLOAD_IMAGES_REQUEST,
      data: formData,
    });
  }, [dispatch]);

  const onRemoveImage = useCallback((index) => {
    dispatch({
      type: REMOVE_IMAGE,
      index,
    });
  }, [dispatch]);

  const onTogglePublic = useCallback((checked) => {
    setIsPublic(checked);
  }, []);

  const onSubmit = useCallback(() => {
    if (!content.trim()) return message.warning('내용을 입력해주세요!');
    dispatch({
      type: ADD_POST_REQUEST,
      data: {
        content,
        images: imagePaths,
        isPublic,
      },
    });
  }, [content, imagePaths, isPublic, dispatch]);

  return (
    <Form
      layout="vertical"
      style={{ padding: 24, background: '#fff', borderRadius: 8 }}
      encType="multipart/form-data"
      onFinish={onSubmit}
    >
      <Form.Item label="게시글 내용" required>
        <Input.TextArea
          rows={4}
          placeholder="게시글 내용을 입력하세요"
          value={content}
          onChange={onChangeContent}
        />
      </Form.Item>

      <Form.Item label="이미지 업로드">
        <input
          type="file"
          multiple
          hidden
          ref={imageInput}
          onChange={onChangeImages}
          accept="image/*"
        />
        <Button onClick={onClickImageUpload} loading={uploadImagesLoading}>
          이미지 선택
        </Button>
      </Form.Item>

      {/* [1] 업로드 전 프론트 미리보기 */}
      {previewImages.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {previewImages.map((src, idx) => (
            <div key={src} style={{ marginBottom: 8 }}>
              <img 
                src={src} 
                alt="미리보기" 
                style={{ width: '200px', borderRadius: 4 }} 
              />
            </div>
          ))}
        </div>
      )}

      {/* [2] 서버 업로드 성공 시 미리보기 */}
      {imagePaths.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {imagePaths.map((src, idx) => (
            <div key={src} style={{ marginBottom: 8 }}>
              <img 
                src={`http://localhost:3065/uploads/post/${src}`} 
                alt="업로드 완료" 
                style={{ width: '200px', borderRadius: 4 }} 
              />
              <Button danger onClick={() => onRemoveImage(idx)}>
                삭제
              </Button>
            </div>
          ))}
        </div>
      )}

      <Form.Item label="공개 설정">
        <Switch checked={isPublic} onChange={onTogglePublic} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={addPostLoading}>
          게시하기
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PostForm;

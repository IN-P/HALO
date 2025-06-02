import React, { useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ADD_POST_IN_REQUEST } from '../reducers/post_IN';

const PostForm = () => {
  const dispatch = useDispatch();
  const { addPostLoading } = useSelector((state) => state.post_IN);
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const imageInput = useRef();

  const onChangeText = useCallback((e) => {
    setText(e.target.value);
  }, []);

  const onChangeImages = useCallback((e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  }, []);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('content', text);
      images.forEach((image) => formData.append('image', image));
      dispatch({
        type: ADD_POST_IN_REQUEST,
        data: formData,
      });
      setText('');
      setImages([]);
    },
    [text, images, dispatch]
  );

  return (
    <form onSubmit={onSubmit} encType="multipart/form-data">
      <textarea
        value={text}
        onChange={onChangeText}
        rows={4}
        placeholder="무슨 일이 일어나고 있나요?"
      />
      <div>
        <input
          type="file"
          multiple
          hidden
          ref={imageInput}
          onChange={onChangeImages}
        />
        <button type="button" onClick={() => imageInput.current.click()}>
          이미지 업로드
        </button>
        <button type="submit" disabled={addPostLoading}>
          짹
        </button>
      </div>
    </form>
  );
};

export default PostForm;

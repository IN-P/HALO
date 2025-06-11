import React, { useCallback, useState, useRef } from 'react';
import { Form, Input, Button, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { UPLOAD_IMAGES_REQUEST, REMOVE_IMAGE } from '../reducers/adminPlayer_GM';
import useInput from '../hooks/useInput';

const { Option } = Select;

const PlayerForm = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const { imagePaths } = useSelector((state) => state.adminPlayer);
  const [name, onChangeName, setName] = useInput('');
  const [rarity, setRarity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmitForm = useCallback(() => {
    if (!name.trim()) {
      return alert('선수 이름을 입력하세요.');
    }
    if (!rarity) {
      return alert('등급을 선택하세요.');
    }
    if (!imagePaths || imagePaths.length === 0) {
      return alert('이미지를 업로드하세요.');
    }

    setIsSubmitting(true);

    const body = {
      name,
      rarity,
      image_url: imagePaths[0],
    };

    fetch('http://localhost:3065/store/admin/players', {  // ✅ 경로 수정
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || '등록 실패');
        alert('선수 등록 완료');
        onSubmit?.(data.player);

        // ✅ 폼 초기화
        setName('');
        setRarity('');
      })
      .catch((err) => {
        console.error('등록 오류:', err);
        alert('등록 중 오류 발생');
      })
      .finally(() => setIsSubmitting(false));
  }, [name, rarity, imagePaths, onSubmit]);

  const imageInput = useRef();
  const onClickImageUpload = useCallback(() => {
    imageInput.current?.click();
  }, []);

  const onChangeImages = useCallback((e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFormData = new FormData();
    [].forEach.call(files, (file) => {
      imageFormData.append('image', file);
    });

    dispatch({
      type: UPLOAD_IMAGES_REQUEST,
      data: imageFormData,
    });
  }, [dispatch]);

  const onRemoveImage = useCallback((index) => () => {
    dispatch({
      type: REMOVE_IMAGE,
      data: index,
    });
  }, [dispatch]);

  return (
    <Form layout="vertical" style={{ margin: '3%' }} onFinish={onSubmitForm}>
      <Form.Item label="이름">
        <Input value={name} onChange={onChangeName} />
      </Form.Item>

      <Form.Item label="등급">
        <Select value={rarity} onChange={setRarity}>
          <Option value="">선택</Option>
          <Option value="NORMAL">NORMAL</Option>
          <Option value="RARE">RARE</Option>
          <Option value="LEGEND">LEGEND</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <input
          type="file"
          name="image"
          multiple
          hidden
          ref={imageInput}
          onChange={onChangeImages}
        />
        <Button onClick={onClickImageUpload}>이미지 업로드</Button>
        <Button type="primary" style={{ float: 'right' }} htmlType="submit" loading={isSubmitting}>
          등록
        </Button>
      </Form.Item>

      <div>
        {Array.isArray(imagePaths) &&
          imagePaths.map((v, i) => (
            <div key={v} style={{ display: 'inline-block', marginRight: 8 }}>
              <img src={`http://localhost:3065${v}`} style={{ width: '200px' }} />
              <div>
                <Button onClick={onRemoveImage(i)}>제거</Button>
              </div>
            </div>
          ))}
      </div>
    </Form>
  );
};

export default PlayerForm;

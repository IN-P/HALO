// components/ImageUploadCarousel.js
import React from 'react';
import { Carousel, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const ImageUploadCarousel = ({ images, onRemove }) => {
  return (
    <Carousel autoplay dots draggable style={{ marginTop: 16 }}>
      {images.map((src, idx) => (
        <motion.div key={src} whileHover={{ scale: 1.02 }} style={{ position: 'relative' }}>
          <img
            src={`http://localhost:3065/uploads/post/${src}`}
            alt="preview"
            style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 10 }}
          />
          <Button
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => onRemove(idx)}
            style={{ position: 'absolute', top: 10, right: 10 }}
          />
        </motion.div>
      ))}
    </Carousel>
  );
};

export default ImageUploadCarousel;

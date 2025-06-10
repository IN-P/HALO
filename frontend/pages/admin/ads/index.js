// pages/admin/ads/index.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';


const cardStyle = {
  width: 320,
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  background: '#fff',
  marginBottom: 20,
  display: 'inline-block',
  marginRight: 20,
  verticalAlign: 'top',
};

const imageBoxStyle = {
  width: '100%',
  height: 200,
  background: '#f0f0f0',
  overflow: 'hidden',
};

const contentBoxStyle = {
  padding: '16px',
  textAlign: 'left',
};

const buttonStyle = {
  padding: '6px 12px',
  fontSize: '14px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#1890ff',
  color: '#fff',
};

const AdminAdsPage = () => {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({
    title: '',
    target_url: '',
    start_date: '',
    end_date: '',
    is_active: true,
    image: null,
  });
  const [editingAdId, setEditingAdId] = useState(null);

  const fetchAds = async () => {
    try {
      const res = await axios.get('http://localhost:3065/advertisement', { withCredentials: true });
      setAds(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageFilename = null;

      if (form.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', form.image);

        const imageRes = await axios.post('http://localhost:3065/advertisement/image', imageFormData, {
          withCredentials: true,
        });

        imageFilename = imageRes.data;
      }

      const payload = {
        title: form.title,
        target_url: form.target_url,
        start_date: form.start_date,
        end_date: form.end_date,
        is_active: form.is_active,
        ...(imageFilename && { image_url: imageFilename }),
      };

      if (editingAdId) {
        await axios.patch(`http://localhost:3065/advertisement/${editingAdId}`, payload, {
          withCredentials: true,
        });
        setEditingAdId(null);
      } else {
        await axios.post('http://localhost:3065/advertisement', payload, { withCredentials: true });
      }

      setForm({
        title: '',
        target_url: '',
        start_date: '',
        end_date: '',
        is_active: true,
        image: null,
      });

      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (ad) => {
    setEditingAdId(ad.id);
    setForm({
      title: ad.title,
      target_url: ad.target_url,
      start_date: ad.start_date?.slice(0, 10),
      end_date: ad.end_date?.slice(0, 10),
      is_active: ad.is_active,
      image: null,
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3065/advertisement/${id}`, { withCredentials: true });
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h1>📢 광고 관리</h1>

      <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px' }}>
        <h2>{editingAdId ? '광고 수정' : '광고 등록'}</h2>
        <input type="text" name="title" placeholder="광고명" value={form.title} onChange={handleChange} required /><br />
        <input type="text" name="target_url" placeholder="타겟 URL" value={form.target_url} onChange={handleChange} required /><br />
        <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required /><br />
        <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required /><br />
        <label>
          노출 여부:
          <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
        </label><br />
        <input type="file" name="image" accept="image/*" onChange={handleChange} /><br />
        <button type="submit" style={{ marginTop: '10px' }}>
          {editingAdId ? '수정 완료' : '광고 등록'}
        </button>
      </form>

      <h2>📜 광고 목록</h2>
      {ads.length === 0 ? (
        <p>등록된 광고가 없습니다.</p>
      ) : (
        ads.map((ad) => (
          <div key={ad.id} style={cardStyle}>
            <div style={imageBoxStyle}>
              <img
                src={`http://localhost:3065/advertisement_uploads/${ad.image_url}`}
                alt={ad.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
              />
            </div>
            <div style={contentBoxStyle}>
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>{ad.title}</h3>
              <p style={{ fontSize: 14, marginBottom: 4 }}>
                📅 {ad.start_date?.slice(0, 10)} ~ {ad.end_date?.slice(0, 10)}
              </p>
              <p style={{ fontSize: 14, marginBottom: 8 }}>
                🔘 상태: {ad.is_active ? '노출중' : '비노출'}
              </p>
              <a href={ad.target_url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline', fontSize: 14 }}>
                광고 보러가기 →
              </a>
              <div style={{ marginTop: '12px' }}>
                <button onClick={() => handleEdit(ad)} style={buttonStyle}>수정</button>
                <button onClick={() => handleDelete(ad.id)} style={{ ...buttonStyle, marginLeft: '8px', backgroundColor: '#ff4d4f' }}>삭제</button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminAdsPage;

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaPaperPlane, FaTimes } from 'react-icons/fa';

export default function CreatePost() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
      setImage(null);
      setPreview(null);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    
    if (!caption && !image) return alert('Boş gönderi paylaşılamaz!');

    const formData = new FormData();
    formData.append('userId', user.id);
    formData.append('caption', caption);
    if (image) formData.append('image', image);

    try {
      await axios.post('http://localhost:5000/api/users/share', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Paylaşıldı!');
      navigate('/feed'); // Akışa dön
    } catch (error) {
      alert('Hata oluştu.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '500px', background: '#181818', padding: '30px', borderRadius: '10px', border: '1px solid #333' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Gönderi Oluştur</h2>
        
        {/* Önizleme Alanı (Varsa Göster) */}
        {preview ? (
            <div style={{ position:'relative', marginBottom:'20px' }}>
                <img src={preview} style={{ width: '100%', borderRadius:'8px', maxHeight:'300px', objectFit:'cover' }} />
                <button onClick={removeImage} style={{position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.7)', color:'white', border:'none', borderRadius:'50%', width:'30px', height:'30px', cursor:'pointer'}}><FaTimes/></button>
            </div>
        ) : (
            <div style={{ marginBottom: '20px', textAlign:'center', padding:'20px', border:'2px dashed #444', borderRadius:'8px', color:'#666' }}>
                <p>Resim eklemek istersen aşağıdan seç (Zorunlu Değil)</p>
            </div>
        )}

        <form onSubmit={handleShare}>
          <input type="file" id="fileInput" onChange={handleImageChange} style={{ display: 'none' }} />
          
          <label htmlFor="fileInput" style={{ display: 'block', background: '#333', color: 'white', padding: '10px', textAlign: 'center', borderRadius: '5px', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold' }}>
            <FaImage /> Fotoğraf Ekle / Değiştir
          </label>

          <textarea 
            placeholder="Ne düşünüyorsun? (Metin yazabilirsin)" 
            value={caption}
            onChange={e => setCaption(e.target.value)}
            style={{ width: '100%', padding: '15px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '5px', marginBottom: '15px', minHeight: '80px', boxSizing:'border-box' }}
          ></textarea>

          <button type="submit" style={{ width: '100%', padding: '15px', background: '#e50914', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            <FaPaperPlane /> Paylaş
          </button>
        </form>
      </div>
    </div>
  );
}
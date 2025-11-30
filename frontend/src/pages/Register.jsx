import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    passwordConfirm: '' 
  });
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 
    if (formData.password !== formData.passwordConfirm) {
        setError("Şifreler birbiriyle uyuşmuyor!");
        return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password
      });
      
      alert('Kayıt Başarılı! Giriş yapabilirsiniz.');
      navigate('/'); 
    } catch (err) {
      
      setError(err.response?.data?.error || 'Sunucuyla bağlantı kurulamadı veya bir hata oluştu.');
    }
  };

  return (
    <>
      <div className="login-background"></div>
      <div className="login-overlay"></div>

      <div className="netflix-logo">NETFİLİZ</div>

      <div className="login-page-content">
        <div className="login-box" style={{ minHeight: '580px' }}>
          <h2>Üye Ol</h2>
          
          {/* --- HATA MESAJI KUTUSU (Varsa Göster) --- */}
          {error && (
            <div style={{ 
              background: '#e87c03', 
              padding: '10px 15px', 
              borderRadius: '4px', 
              marginBottom: '20px', 
              fontSize: '14px', 
              color: 'white' 
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input 
              className="custom-input" type="text" placeholder="Kullanıcı Adı" required
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            <input 
              className="custom-input" type="email" placeholder="E-posta adresi" required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input 
              className="custom-input" type="password" placeholder="Parola oluştur" required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <input 
              className="custom-input" type="password" placeholder="Parolayı tekrar girin" required
              onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
            />
            
            <button type="submit" className="signin-btn">Kayıt Ol</button>
          </form>

          <div className="signup-text">
            Zaten bir hesabın var mı? <Link to="/">Oturum Aç.</Link>
          </div>
        </div>
      </div>
    </>
  );
}
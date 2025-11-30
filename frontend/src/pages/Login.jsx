import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); 

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      navigate('/feed');
    } catch (err) {
      
      setError(err.response?.data?.error || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    }
  };

  return (
    <>
      <div className="login-background"></div>
      <div className="login-overlay"></div>

      <div className="netflix-logo">NETFİLİZ</div>

      <div className="login-page-content">
        <div className="login-box">
          <h2>Oturum Aç</h2>
          
          {/* --- HATA MESAJI KUTUSU (Turuncu Renk) --- */}
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
              className="custom-input" type="email" placeholder="E-posta veya telefon numarası" required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input 
              className="custom-input" type="password" placeholder="Parola" required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            
            <button type="submit" className="signin-btn">Oturum Aç</button>
          </form>
<div style={{textAlign:'right', marginBottom:'20px'}}>
    <Link to="/forgot-password" style={{color:'#b3b3b3', fontSize:'13px', textDecoration:'none'}}>Şifreni mi unuttun?</Link>
</div>
          <div className="signup-text">
            Netfiliz'de yeni misiniz? 
            <Link to="/register">Şimdi kaydolun.</Link>
          </div>
        </div>
      </div>
    </>
  );
}
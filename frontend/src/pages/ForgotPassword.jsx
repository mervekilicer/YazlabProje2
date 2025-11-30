import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      alert(res.data.message);
    } catch (error) { alert(error.response?.data?.error || 'Hata'); }
  };

  return (
    <div style={{height:'100vh', background:'black', display:'flex', justifyContent:'center', alignItems:'center', color:'white'}}>
      <div style={{width:'400px', background:'#181818', padding:'40px', borderRadius:'8px', border:'1px solid #333'}}>
        <h2 style={{textAlign:'center'}}>Şifremi Unuttum</h2>
        <p style={{color:'#aaa', textAlign:'center', marginBottom:'20px'}}>E-posta adresini gir, sana sıfırlama bağlantısı gönderelim.</p>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="E-posta" required onChange={e => setEmail(e.target.value)} style={{width:'100%', padding:'12px', marginBottom:'15px', background:'#333', border:'none', color:'white', boxSizing:'border-box'}} />
          <button type="submit" style={{width:'100%', padding:'12px', background:'#e50914', color:'white', border:'none', fontWeight:'bold', cursor:'pointer'}}>Gönder</button>
        </form>
        <div style={{textAlign:'center', marginTop:'20px'}}>
            <Link to="/" style={{color:'#aaa', textDecoration:'none'}}>Giriş'e Dön</Link>
        </div>
      </div>
    </div>
  );
}
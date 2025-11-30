import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', { email, token, newPassword });
      alert(res.data.message);
      navigate('/');
    } catch (error) { alert(error.response?.data?.error || 'Hata'); }
  };

  return (
    <div style={{height:'100vh', background:'black', display:'flex', justifyContent:'center', alignItems:'center', color:'white'}}>
      <div style={{width:'400px', background:'#181818', padding:'40px', borderRadius:'8px', border:'1px solid #333'}}>
        <h2 style={{textAlign:'center'}}>Yeni Şifre Belirle</h2>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Yeni Parola" required onChange={e => setNewPassword(e.target.value)} style={{width:'100%', padding:'12px', marginBottom:'15px', background:'#333', border:'none', color:'white', boxSizing:'border-box'}} />
          <button type="submit" style={{width:'100%', padding:'12px', background:'#e50914', color:'white', border:'none', fontWeight:'bold', cursor:'pointer'}}>Güncelle</button>
        </form>
      </div>
    </div>
  );
}
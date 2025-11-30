import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch } from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)', backgroundColor: '#141414', position: 'sticky', top: 0, zIndex: 100, height: '70px' }}>
      <div style={{ flex: 1 }}>
        <Link to="/feed" style={{ fontSize: '30px', fontWeight: '900', color: '#E50914', fontFamily: "'Arial Black', sans-serif", letterSpacing: '-1px', textDecoration: 'none', textTransform: 'uppercase' }}>NETFİLİZ</Link>
      </div>
      <div style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
        <Link to="/feed" style={{ color: 'white', fontWeight: '500', textDecoration:'none', fontSize:'14px' }}>Ana Sayfa</Link>
        <Link to="/social" style={{ color: 'white', fontWeight: '500', textDecoration:'none', fontSize:'14px' }}>Sosyal</Link>
        <Link to="/search" style={{ color: 'white', fontWeight: '500', textDecoration:'none', fontSize:'14px' }}>Arama Motoru</Link>
        <Link to="/share" style={{ color: 'white', fontSize: '18px', display:'flex', alignItems:'center' }} title="Gönderi Paylaş"><FaPlus /></Link>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
        {user && (
          <Link to={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration:'none' }}>
             <img 
               src={user.avatar} 
               // EĞER RESİM YÜKLENMEZSE YEDEK RESMİ GÖSTER
               onError={(e) => {e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=random`}}
               style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit:'cover' }} 
             />
          </Link>
        )}
        <button onClick={handleLogout} style={{ padding: '6px 12px', fontSize: '13px', background: '#E50914', color: 'white', border: 'none', borderRadius: '4px', cursor:'pointer', fontWeight:'bold' }}>Çıkış</button>
      </div>
    </nav>
  );
}
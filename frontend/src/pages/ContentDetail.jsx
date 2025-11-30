import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaArrowLeft, FaTrash, FaCheck, FaClock, FaList, FaPlus, FaPen } from 'react-icons/fa';

export default function ContentDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
const isMovie = type === 'movie';
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myLists, setMyLists] = useState([]); 
  const [showListMenu, setShowListMenu] = useState(false); 
  
  
  const [currentStatus, setCurrentStatus] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  
  const formRef = useRef(null);

  useEffect(() => { fetchDetails(); }, [id]);

  const fetchDetails = async () => {
    try {
      
      const endpoint = type === 'movie' ? `http://localhost:5000/api/movies/${id}` : `http://localhost:5000/api/books/${id}`;
      const res = await axios.get(endpoint);
      setContent(res.data);
      
      
      if (user) {
          const statusRes = await axios.get(`http://localhost:5000/api/library/check/${user.id}`, {
              params: { externalId: id, type: type }
          });
          setCurrentStatus(statusRes.data.status);
          
          
          if(res.data.reviews) {
              const myReview = res.data.reviews.find(r => r.user?.id === user.id);
              if(myReview) {
                  setReview(myReview.text);
                  setRating(myReview.rating || 0);
              }
          }

          
          const listRes = await axios.get(`http://localhost:5000/api/users/custom-list/${user.id}`);
          setMyLists(listRes.data);
      }
      setLoading(false);
    } catch (error) { setLoading(false); }
  };

const handleMainAction = async (targetStatus) => {
    
    if (!user) return alert('Lütfen önce giriş yapın!');

    
    let dbStatus = targetStatus; 

    
    const safePayload = {
        userId: user.id || user._id, 
        status: dbStatus, 
        rating: rating || 0,
        review: review || '',
        content: { 
            external_id: (content.id || id).toString(), 
            type: type, 
            title: content.title || "Başlıksız İçerik", 
            poster_path: content.poster_path || "", 
            release_date: content.release_date || "" 
        }
    };

    console.log("Sunucuya giden GÜVENLİ veri:", safePayload);

    try {
      await axios.post('http://localhost:5000/api/library/add', safePayload);

      
      setCurrentStatus(dbStatus);
      alert('İşlem Başarılı! Listene eklendi.');
      fetchDetails(); 
      
    } catch (error) { 
      
      console.error("Hata Detayı:", error);
      
      
      const serverMsg = error.response?.data?.message || error.response?.data?.error;
      
      if (serverMsg) {
          alert(`Sunucu Hatası: ${serverMsg}`);
      } else {
          alert("Bilinmeyen sunucu hatası (500). Lütfen VS Code'daki Backend terminaline bak.");
      }
    }
  };
  const handleAddToCustomList = async (listId) => {
      try {
          await axios.post('http://localhost:5000/api/users/custom-list/add', {
              listId,
              content: { external_id: content.id, type, title: content.title, poster_path: content.poster_path, release_date: content.release_date }
          });
          alert('Listeye Eklendi!');
          setShowListMenu(false);
      } catch (error) { alert('Hata'); }
  };

  
  const handleDeleteReview = async (reviewId) => {
      if(!window.confirm("Yorumunu silmek istiyor musun?")) return;
      try {
          
          await axios.delete(`http://localhost:5000/api/users/content-review/${reviewId}`, { data: { userId: user.id } });
          setReview('');
          setRating(0);
          fetchDetails();
          alert('Silindi.');
      } catch (e) { alert('Hata.'); }
  };

  const handleEditClick = (rev) => {
      setReview(rev.text);
      setRating(rev.rating || 0);
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading || !content) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  return (
    <div style={{ background: '#141414', minHeight: '100vh', color: 'white', paddingBottom: '50px' }}>
      
      {/* KAPAK */}
      <div style={{ height: '60vh', position: 'relative', backgroundImage: `url(${content.backdrop_path || content.poster_path})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}>
        <div style={{position:'absolute', inset:0, background:'linear-gradient(to top, #141414, transparent)'}}></div>
        <button onClick={() => navigate(-1)} style={{position:'absolute', top:20, left:20, background:'rgba(0,0,0,0.5)', border:'none', color:'white', padding:'10px', borderRadius:'50%', cursor:'pointer'}}><FaArrowLeft size={20}/></button>
      </div>

      <div className="container" style={{ maxWidth: '1100px', margin: '-150px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            
            {/* POSTER */}
            <img src={content.poster_path} style={{ width: '250px', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }} />

            <div style={{ flex: 1, marginTop: '80px' }}>
                <h1 style={{ fontSize: '45px', fontWeight: 'bold', marginBottom: '10px', lineHeight:'1' }}>{content.title}</h1>
                
                {/* Platform Puanı */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', fontSize: '16px' }}>
                    <span style={{ color: '#46d369', fontWeight: 'bold', border: '1px solid #46d369', padding: '2px 8px', borderRadius: '4px' }}>
                        Netfiliz Puanı: {content.platformRating > 0 ? `${content.platformRating}/10` : 'Henüz Yok'}
                    </span>
                    <span style={{color:'#aaa'}}>({content.totalVotes} oy)</span>
                    <span>{content.release_date?.substring(0,4)}</span>
                </div>

                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#ddd', marginBottom: '20px' }}>{content.overview}</p>
                
                <div style={{fontSize:'14px', color:'#aaa'}}>
                    <p><strong style={{color:'white'}}>{type === 'movie' ? 'Yönetmen:' : 'Yazar:'}</strong> {content.director}</p>
                    <p><strong style={{color:'white'}}>Türler:</strong> {content.genres?.join(', ')}</p>
                </div>

                {/* --- BUTONLAR (RENKLİ VE DURUMLU) --- */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px', position:'relative' }}>
                    
                    {/* İZLEDİM / OKUDUM */}
                    <button 
                        onClick={() => handleMainAction('watched')} 
                        style={{ 
                            flex:1, padding: '15px', 
                            background: currentStatus === 'watched' ? '#46d369' : '#e50914', 
                            color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', fontSize:'16px',
                            opacity: currentStatus === 'watched' ? 1 : 0.9
                        }}
                    >
                       <FaCheck /> {currentStatus === (type==='movie'?'watched':'okudum') ? (type==='movie'?'İzlendi':'Okundu') : (type==='movie'?'İzledim':'Okudum')}
                    </button>

                    {/* İZLEYECEĞİM / OKUYACAĞIM */}
                    <button 
                        onClick={() => handleMainAction('to_watch')} 
                        style={{ 
                            flex:1, padding: '15px', 
                            background: currentStatus === 'to_watch' ? '#007bff' : '#333', 
                            color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', fontSize:'16px' 
                        }}
                    >
                        <FaClock /> {currentStatus === 'to_watch' ? 'Listede' : (type==='movie'?'İzleyeceğim':'Okuyacağım')}
                    </button>
                    
                    <div style={{position:'relative'}}>
                        <button onClick={() => setShowListMenu(!showListMenu)} style={{ height:'100%', width:'60px', background: '#222', border: '1px solid #444', color: 'white', borderRadius: '4px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center' }} title="Özel Listeye Ekle">
                            <FaList size={20} />
                        </button>
                        {showListMenu && (
                            <div style={{position:'absolute', top:'110%', right:0, width:'200px', background:'#1f1f1f', border:'1px solid #333', borderRadius:'4px', padding:'10px', zIndex:100}}>
                                <h4 style={{margin:'0 0 10px 0', fontSize:'14px', borderBottom:'1px solid #333', paddingBottom:'5px'}}>Listelerine Ekle</h4>
                                {myLists.length === 0 ? <div style={{fontSize:'12px', color:'#777'}}>Listen yok.</div> : (
                                    myLists.map(list => (
                                        <div key={list.id} onClick={() => handleAddToCustomList(list.id)} style={{padding:'8px', cursor:'pointer', fontSize:'13px', borderBottom:'1px solid #333'}}>{list.title}</div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* SENİN GÖRÜŞÜN */}
                <div ref={formRef} style={{ marginTop: '30px', background: '#222', padding: '20px', borderRadius: '8px' }}>
                    <h3 style={{marginTop:0, fontSize:'18px'}}>Senin Görüşün</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
                        {[...Array(10)].map((_, i) => ( <FaStar key={i} color={i < rating ? "#e50914" : "#555"} style={{ cursor: 'pointer', fontSize:'20px' }} onClick={() => setRating(i + 1)} /> ))}
                        <span style={{fontWeight:'bold', marginLeft:'10px'}}>{rating}/10</span>
                    </div>
                    <textarea placeholder="Yorumunu yaz..." value={review} onChange={e => setReview(e.target.value)} style={{ width: '100%', background: '#141414', border: '1px solid #333', color: 'white', padding: '10px', borderRadius: '4px', minHeight: '80px', boxSizing:'border-box' }}></textarea>
                    <div style={{textAlign:'right', marginTop:'10px'}}>
                        <button onClick={() => handleMainAction('watched')} style={{background:'white', color:'black', padding:'8px 20px', border:'none', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>Gönder / Güncelle</button>
                    </div>
                </div>
            </div>
        </div>

        {/* YORUMLAR LİSTESİ */}
        <div style={{ marginTop: '50px', maxWidth:'800px' }}>
            <h2 style={{ borderBottom:'1px solid #333', paddingBottom:'10px', marginBottom:'20px' }}>Kullanıcı Yorumları ({content.reviews?.length || 0})</h2>
            {content.reviews && content.reviews.length > 0 ? (
                content.reviews.map(rev => (
                    <div key={rev.id} style={{ background: '#1f1f1f', padding: '20px', borderRadius: '8px', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <img src={rev.user?.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#e50914' }}>{rev.user?.username}</div>
                                    <div style={{ fontSize: '12px', color: '#777' }}>{new Date(rev.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                            {rev.rating > 0 && <div style={{ color: '#e50914', fontWeight: 'bold' }}>★ {rev.rating}/10</div>}
                        </div>
                        <p style={{ marginTop: '15px', color: '#ddd', lineHeight:'1.5' }}>{rev.text}</p>
                        
                        {/* DÜZENLE VE SİL BUTONLARI */}
                        {user && user.id === rev.user?.id && (
                            <div style={{ display:'flex', gap:'15px', marginTop:'10px' }}>
                                <button onClick={() => handleEditClick(rev)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize:'12px', display:'flex', alignItems:'center', gap:'5px' }}> 
                                    <FaPen /> Düzenle 
                                </button>
                                <button onClick={() => handleDeleteReview(rev.id)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize:'12px', display:'flex', alignItems:'center', gap:'5px' }}> 
                                    <FaTrash /> Sil 
                                </button>
                            </div>
                        )}
                    </div>
                ))
            ) : ( <p style={{ color: '#555' }}>Henüz yorum yok.</p> )}
        </div>
      </div>
    </div>
  );
}
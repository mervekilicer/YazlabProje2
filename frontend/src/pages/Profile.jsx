import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPen, FaCheckCircle, FaClock, FaBook, FaList, FaHistory, FaPlus, FaHeart, FaImage, FaDice, FaTimes, FaTrash } from 'react-icons/fa';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  let currentUser = null;
  try { currentUser = JSON.parse(localStorage.getItem('user')); } catch(e) {}

  
  const [profileUser, setProfileUser] = useState({ username: '...', avatar: '', bio: '' });
  const [library, setLibrary] = useState([]);      
  const [customLists, setCustomLists] = useState([]); 
  const [activities, setActivities] = useState([]);   
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [followData, setFollowData] = useState({ followersCount: 0, followingCount: 0, followers: [], following: [] });
  
  const [activeTab, setActiveTab] = useState('watched_movie');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  

  const [showEditModal, setShowEditModal] = useState(false);
  const [showListModal, setShowListModal] = useState(null);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  
  
  const [newListTitle, setNewListTitle] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('Felix');
  const [bio, setBio] = useState('');

  
  const getAvatarUrl = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

  
  useEffect(() => { if(userId) fetchAllData(); }, [userId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
      setProfileUser(userRes.data);
      setBio(userRes.data.bio || '');

      if(userRes.data.avatar && userRes.data.avatar.includes('seed=')) {
          setAvatarSeed(userRes.data.avatar.split('seed=')[1]);
      }

      const [libRes, listRes, actRes, statsRes, postsRes, likedRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/library/${userId}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/users/custom-list/${userId}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/users/activities/${userId}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/users/stats/${userId}`).catch(() => ({ data: { followersCount:0, followingCount:0, followers:[], following:[] } })),
          axios.get(`http://localhost:5000/api/users/posts/${userId}`).catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/users/liked/${userId}`).catch(() => ({ data: [] }))
      ]);

      setLibrary(libRes.data);
      setCustomLists(listRes.data);
      setActivities(actRes.data);
      setFollowData(statsRes.data);
      setPosts(postsRes.data);
      setLikedPosts(likedRes.data);

      if (currentUser && statsRes.data.followers) {
          setIsFollowing(statsRes.data.followers.some(u => u.id === currentUser.id));
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

 
  const handleRandomAvatar = () => {
      setAvatarSeed(Math.random().toString(36).substring(7));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const finalUrl = getAvatarUrl(avatarSeed);
    try {
      const res = await axios.put(`http://localhost:5000/api/users/${currentUser.id}`, { bio, avatar: finalUrl });
      alert('Profil Güncellendi!');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setProfileUser(res.data.user);
      setShowEditModal(false);
      window.location.reload();
    } catch (error) { alert('Hata'); }
  };

  const handleFollowToggle = async () => {
      try {
          const endpoint = isFollowing ? 'unfollow' : 'follow';
          await axios.post(`http://localhost:5000/api/users/${endpoint}`, { followerId: currentUser.id, followingId: userId });
          setIsFollowing(!isFollowing);
          setFollowData(prev => ({ ...prev, followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1 }));
      } catch (error) { alert('Hata'); }
  };

  const handleCreateList = async () => {
      if(!newListTitle) return;
      try {
          await axios.post('http://localhost:5000/api/users/custom-list', { userId: currentUser.id, title: newListTitle });
          alert('Liste Oluşturuldu!');
          setShowCreateListModal(false);
          setNewListTitle('');
          fetchAllData(); 
      } catch(e) { alert('Hata'); }
  };

  
  const getFilteredContent = () => {
      if (activeTab === 'custom_lists') return customLists;
      if (activeTab === 'activities') return activities;
      if (activeTab === 'posts') return posts;
      if (activeTab === 'liked') return likedPosts;

      return library.filter(item => {
          if (activeTab === 'watched_movie') return item.status === 'watched' && item.Content?.type === 'movie';
          if (activeTab === 'to_watch_movie') return item.status === 'to_watch' && item.Content?.type === 'movie';
          if (activeTab === 'read_book') return (item.status === 'read' || item.status === 'watched') && item.Content?.type === 'book';
          if (activeTab === 'to_read_book') return (item.status === 'to_read' || item.status === 'to_watch') && item.Content?.type === 'book';
          return false;
      });
  };

  const list = getFilteredContent();

  if(loading) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#141414', color: 'white', paddingBottom: '50px' }}>
      
      {/* KAPAK */}
      <div style={{ height: '250px', background: 'linear-gradient(to bottom, #b81d24, #141414)' }}></div>

      {/* HEADER */}
      <div className="container" style={{ marginTop: '-100px', padding: '0 40px', display: 'flex', alignItems: 'flex-end', gap: '30px', maxWidth:'1200px', margin:'-100px auto 0 auto' }}>
        <img 
            src={profileUser?.avatar || getAvatarUrl('default')} 
            style={{ width: '180px', height: '180px', borderRadius: '50%', border: '6px solid #141414', background:'#222', objectFit:'cover' }} 
            onError={(e) => {e.target.src='https://placehold.co/180x180/333/FFF?text=User'}}
        />
        
        <div style={{ marginBottom: '20px', flex: 1 }}>
          <h1 style={{ fontSize: '40px', margin: '0 0 10px 0', fontWeight:'bold' }}>{profileUser?.username}</h1>
          <p style={{color:'#ccc', fontSize:'16px', marginBottom:'15px'}}>{profileUser?.bio || "Henüz biyografi yok."}</p>
          
          <div style={{ display: 'flex', gap: '25px', fontSize: '16px', cursor:'pointer' }}>
             <span><strong>{library.length}</strong> İçerik</span>
             <span onClick={() => setShowListModal('followers')} style={{borderBottom:'1px dotted #aaa'}}><strong>{followData.followersCount}</strong> Takipçi</span>
             <span onClick={() => setShowListModal('following')} style={{borderBottom:'1px dotted #aaa'}}><strong>{followData.followingCount}</strong> Takip</span>
          </div>
        </div>

        <div style={{ marginBottom: '30px', display:'flex', gap:'10px' }}>
          {currentUser?.id == userId ? (
            <>
                <button onClick={() => setShowCreateListModal(true)} style={{ background: '#e50914', color: 'white', padding: '12px 20px', border:'none', borderRadius:'4px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}> 
                  <FaPlus/> Liste
                </button>
                <button onClick={() => navigate('/share')} style={{ background: '#333', color: 'white', padding: '12px 20px', border:'1px solid #555', borderRadius:'4px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}> 
                  <FaImage/> Post
                </button>
                <button onClick={() => { setAvatarSeed(profileUser.avatar?.includes('seed=') ? profileUser.avatar.split('seed=')[1] : 'Felix'); setShowEditModal(true); }} style={{ background: '#333', color: 'white', padding: '12px 20px', border:'1px solid #555', borderRadius:'4px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}> 
                  <FaPen/> Düzenle
                </button>
            </>
          ) : (
            <button onClick={handleFollowToggle} style={{ background: isFollowing ? '#333' : '#e50914', color: 'white', padding: '12px 40px', border:'none', fontWeight:'bold', cursor:'pointer', borderRadius:'4px' }}> 
              {isFollowing ? 'Takipten Çık' : 'Takip Et'} 
            </button>
          )}
        </div>
      </div>

      {/* SEKMELER */}
      <div className="container" style={{ padding: '40px 20px', maxWidth:'1200px', margin:'0 auto' }}>
        <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #333', marginBottom: '30px', flexWrap:'wrap' }}>
            <button onClick={() => setActiveTab('watched_movie')} style={tabStyle(activeTab==='watched_movie')}> <FaCheckCircle/> İzlediklerim</button>
            <button onClick={() => setActiveTab('to_watch_movie')} style={tabStyle(activeTab==='to_watch_movie')}> <FaClock/> Listem</button>
            <button onClick={() => setActiveTab('read_book')} style={tabStyle(activeTab==='read_book')}> <FaBook/> Okuduklarım</button>
            <button onClick={() => setActiveTab('to_read_book')} style={tabStyle(activeTab==='to_read_book')}> <FaBook/> Okunacaklar</button>
            <button onClick={() => setActiveTab('custom_lists')} style={tabStyle(activeTab==='custom_lists')}> <FaList/> Özel Listeler</button>
            <button onClick={() => setActiveTab('activities')} style={tabStyle(activeTab==='activities')}> <FaHistory/> Aktiviteler</button>
            <button onClick={() => setActiveTab('posts')} style={tabStyle(activeTab==='posts')}> <FaImage/> Gönderiler</button>
            <button onClick={() => setActiveTab('liked')} style={tabStyle(activeTab==='liked')}> <FaHeart/> Beğenilen</button>
        </div>

        {/* İÇERİK GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
           
           {/* DURUM A: ÖZEL LİSTELER (EKSİKTİ, EKLENDİ) */}
           {activeTab === 'custom_lists' && list.map(l => (
               <div key={l.id} style={{ marginBottom: '40px', gridColumn:'1/-1', background:'#222', padding:'20px', borderRadius:'8px' }}>
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #333', paddingBottom:'10px'}}>
                       <h3 style={{ color: '#e50914', margin:0, fontSize: '20px', borderLeft:'4px solid white', paddingLeft:'10px' }}>{l.title}</h3>
                   </div>
                   {l.Contents && l.Contents.length > 0 ? (
                       <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px', scrollbarWidth:'none' }}>
                           {l.Contents.map(content => (
                               <Link to={`/content/${content.type}/${content.external_id}`} key={content.id} style={{flex:'0 0 auto'}}>
                                   <img src={content.poster_path} style={{ width: '120px', borderRadius: '4px', transition:'0.2s', aspectRatio:'2/3', objectFit:'cover' }} onError={(e)=>{e.target.src='https://placehold.co/120x180/333/FFF?text=Poster'}} />
                                   <div style={{color:'white', fontSize:'11px', marginTop:'5px', width:'120px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{content.title}</div>
                               </Link>
                           ))}
                       </div>
                   ) : (
                       <div style={{color:'#777', fontSize:'14px'}}>Bu liste boş.</div>
                   )}
               </div>
           ))}

           {/* DURUM B: AKTİVİTELER (EKSİKTİ, EKLENDİ) */}
           {activeTab === 'activities' && list.map(act => (
               <div key={act.id} style={{background:'#1f1f1f', padding:'15px', borderRadius:'8px', borderLeft:'3px solid #e50914', gridColumn:'span 3'}}>
                   <div style={{fontWeight:'bold', color:'white', marginBottom:'5px'}}>{act.Content?.title}</div>
                   <div style={{fontSize:'13px', color:'#ccc'}}>
                       {act.rating > 0 && <span>★ {act.rating}/10 Puan. </span>}
                       {act.review && <span>"{act.review}"</span>}
                   </div>
                   <div style={{fontSize:'11px', color:'#666', marginTop:'5px'}}>{new Date(act.updatedAt).toLocaleDateString()}</div>
               </div>
           ))}

           {/* DURUM C: DİĞERLERİ (FİLM/KİTAP/POST) */}
           {(!['custom_lists', 'activities'].includes(activeTab)) && list.map(item => (
               (item.imageUrl || item.caption) ? (
                   <div key={item.id} style={{ background: '#1f1f1f', borderRadius: '8px', overflow: 'hidden', border:'1px solid #333' }}>
                       {item.imageUrl && <img src={item.imageUrl} style={{ width: '100%', height: '200px', objectFit: 'cover' }} onError={(e)=>{e.target.src='https://placehold.co/400x300/333/FFF?text=Resim+Yok'}} />}
                       <div style={{ padding: '10px', fontSize: '12px', color:'#ccc' }}>{item.caption || 'Görsel Paylaşımı'}</div>
                       {activeTab === 'liked' && <div style={{padding:'0 10px 10px', fontSize:'10px', color:'#e50914'}}>Beğendin</div>}
                   </div>
               ) : (
                   <Link to={`/content/${item.Content?.type}/${item.Content?.external_id}`} key={item.id} style={{display:'block', textDecoration:'none'}}>
                       <div style={{position:'relative', borderRadius:'8px', overflow:'hidden', background:'#1f1f1f'}}>
                           <img src={item.Content?.poster_path} style={{ width: '100%', height:'250px', objectFit:'cover', display:'block' }} onError={(e)=>{e.target.src='https://placehold.co/200x300/333/FFF?text=Poster'}} />
                           <h4 style={{color:'white', fontSize:'14px', padding:'10px', margin:0}}>{item.Content?.title}</h4>
                       </div>
                   </Link>
               )
           ))}
        </div>
        
        {list.length === 0 && activeTab !== 'custom_lists' && <div style={{textAlign:'center', color:'#555', marginTop:'50px'}}>Liste boş.</div>}
      </div>

      {/* --- MODALLAR --- */}

      {/* 1. AVATAR DÜZENLEME (SADE) */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#181818', padding: '30px', width: '450px', borderRadius: '12px', position:'relative', border: '1px solid #333', display:'flex', flexDirection:'column' }}>
            <button onClick={() => setShowEditModal(false)} style={{position:'absolute', top:15, right:15, background:'transparent', border:'none', color:'white', fontSize:'20px', cursor:'pointer'}}><FaTimes/></button>
            <h2 style={{textAlign:'center', margin:'0 0 20px 0'}}>Avatarını Yenile</h2>
            
            <div style={{textAlign:'center', marginBottom:'20px'}}>
                <img src={getAvatarUrl(avatarSeed)} style={{width:'120px', height:'120px', borderRadius:'50%', border:'4px solid #e50914', background:'#222'}} />
                <div style={{marginTop:'20px'}}>
                    <button onClick={handleRandomAvatar} style={{background:'#333', color:'white', border:'1px solid #555', padding:'10px 20px', borderRadius:'30px', cursor:'pointer', fontWeight:'bold'}}><FaDice/> Rastgele Değiştir</button>
                </div>
            </div>

            <label style={{color:'#aaa', fontSize:'12px', marginBottom:'5px'}}>Biyografi</label>
            <input value={bio} onChange={e => setBio(e.target.value)} style={{ width:'100%', background:'#262626', color:'white', padding:'12px', border:'1px solid #333', borderRadius:'4px', marginBottom:'20px', boxSizing:'border-box' }} placeholder="Kendinden bahset..." />
            
            <button onClick={handleSaveProfile} style={{ width:'100%', background:'#e50914', color:'white', padding:'12px', border:'none', cursor:'pointer', borderRadius:'4px', fontWeight:'bold', fontSize:'16px' }}>Kaydet</button>
          </div>
        </div>
      )}

      {/* 2. LİSTE OLUŞTURMA MODALI */}
      {showCreateListModal && (
          <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
              <div style={{background:'#1f1f1f', padding:'30px', width:'400px', borderRadius:'12px', border:'1px solid #333', position:'relative'}}>
                  <button onClick={() => setShowCreateListModal(false)} style={{position:'absolute', top:10, right:10, background:'transparent', border:'none', color:'white', cursor:'pointer'}}>X</button>
                  <h3>Yeni Liste Oluştur</h3>
                  <input placeholder="Liste Adı" value={newListTitle} onChange={e => setNewListTitle(e.target.value)} style={{width:'100%', padding:'10px', background:'#333', border:'none', color:'white', borderRadius:'4px', marginBottom:'15px', boxSizing:'border-box'}}/>
                  <button onClick={handleCreateList} style={{width:'100%', padding:'12px', background:'#e50914', color:'white', border:'none', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>Oluştur</button>
              </div>
          </div>
      )}

      {/* 3. TAKİPÇİ LİSTESİ MODALI */}
      {showListModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
           <div style={{ background: '#262626', padding: '20px', width: '350px', borderRadius: '12px', position:'relative' }}>
             <button onClick={() => setShowListModal(null)} style={{position:'absolute', top:10, right:10, background:'transparent', border:'none', color:'white', cursor:'pointer'}}>X</button>
             <h3>Listeler</h3>
             <div style={{display:'flex', flexDirection:'column', gap:'15px', maxHeight:'300px', overflowY:'auto'}}>
                {(showListModal === 'followers' ? followData.followers : followData.following).map(u => (
                    <Link to={`/profile/${u.id}`} key={u.id} onClick={() => setShowListModal(null)} style={{display:'flex', alignItems:'center', gap:'12px', textDecoration:'none', color:'white'}}>
                        <img 
                            src={u.avatar} 
                            style={{width:'40px', height:'40px', borderRadius:'50%'}} 
                            onError={(e)=>{e.target.src=`https://ui-avatars.com/api/?name=${u.username}&background=random`}}
                        />
                        <span>{u.username}</span>
                    </Link>
                ))}
                <p style={{color:'#777', textAlign:'center'}}>{(showListModal === 'followers' ? followData.followers : followData.following).length === 0 && "Liste boş."}</p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

const tabStyle = (isActive) => ({
    background: 'transparent', color: isActive?'white':'#888', border: 'none', fontSize: '14px', fontWeight: 'bold', 
    borderBottom: isActive ? '3px solid #e50914' : '3px solid transparent', padding:'10px 0', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' 
});
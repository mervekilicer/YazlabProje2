import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlay, FaInfoCircle, FaHeart, FaRegHeart, FaRegComment, FaPaperPlane, FaImage, FaSearch, FaStar, FaQuoteLeft, FaArrowDown, FaChevronRight, FaUserFriends } from 'react-icons/fa';

export default function Feed() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [categories, setCategories] = useState({});
  const [heroMovie, setHeroMovie] = useState(null);
  const [posts, setPosts] = useState([]); 
  const [commentText, setCommentText] = useState({}); 
  const [loading, setLoading] = useState(true);
  
 
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        
        const [pop, now, top, act, com] = await Promise.all([
            axios.get('http://localhost:5000/api/movies/popular'),
            axios.get('http://localhost:5000/api/movies/now_playing'),
            axios.get('http://localhost:5000/api/movies/top_rated'),
            axios.get('http://localhost:5000/api/movies/genre/28'), 
            axios.get('http://localhost:5000/api/movies/genre/35')  
        ]);

        
        setCategories({
          "Popüler Filmler": pop.data,
          "Vizyondakiler": now.data,
          "Eleştirmenlerin Seçimi": top.data,
          "Adrenalin (Aksiyon)": act.data,
          "Komedi": com.data 
        });

     
        if(pop.data.length > 0) setHeroMovie(pop.data[0]);

       
        await fetchFeed(1);

      } catch (err) { 
        console.error("Veri hatası:", err); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); 
  
  const fetchFeed = async (pageNum) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/feed/${user.id}?page=${pageNum}`);
      
      if (res.data.length === 0) {
          setHasMore(false);
      } else {
          if (pageNum === 1) {
              setPosts(res.data);
          } else {
              setPosts(prev => [...prev, ...res.data]);
          }
      }
    } catch (error) { console.error("Akış hatası:", error); }
  };

  
  const loadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
  };

  
  const handleLike = async (postId) => {
      try {
          await axios.post('http://localhost:5000/api/users/like', { userId: user.id, postId });
          
          
          setPosts(prev => prev.map(post => {
              if(post.id === postId) {
                  const isLiked = post.Likes.some(l => l.UserId === user.id);
                  if(isLiked) post.Likes = post.Likes.filter(l => l.UserId !== user.id);
                  else post.Likes.push({ UserId: user.id });
              }
              return post;
          }));
      } catch(e) { alert('Beğeni işlemi başarısız'); }
  };

  const handleComment = async (postId) => {
      if(!commentText[postId]) return;
      try {
          const res = await axios.post('http://localhost:5000/api/users/comment', { 
              userId: user.id, 
              postId, 
              text: commentText[postId] 
          });
          
          setCommentText({...commentText, [postId]: ''}); 
          
          
          setPosts(prev => prev.map(post => {
              if(post.id === postId) {
                  if(!post.Comments) post.Comments = [];
                  post.Comments.unshift(res.data); 
              }
              return post;
          }));
      } catch(e) { alert('Yorum yapılamadı'); }
  };

  
  const timeAgo = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour:'2-digit', minute:'2-digit' });
  };

  const getActionText = (act) => {
      if (act.caption && !act.Content) return "bir gönderi paylaştı";
      if (act.review) return act.Content?.type === 'book' ? "bir kitap hakkında yorum yaptı" : "bir filme yorum yaptı";
      if (act.rating > 0) return "bir içeriği oyladı";
      if (act.status === 'watched') return "bir içeriği izledi";
      return "listesine ekledi";
  };

  if (loading && !heroMovie) return <div style={{color:'white', textAlign:'center', marginTop:'50px', height:'100vh'}}>Yükleniyor...</div>;

  return (
    <div style={{ background: '#141414', minHeight: '100vh', paddingBottom: '50px', color:'white', overflowX:'hidden' }}>
      
      {/* 1. HERO SECTION (DEV KAPAK) */}
      {heroMovie && (
      <div style={{ 
        height: '75vh', 
        position: 'relative',
        backgroundImage: `url(${heroMovie.poster_path.replace('w500', 'original')})`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center top',
        display: 'flex', alignItems: 'flex-end', padding: '0 50px 100px 50px'
      }}>
        {/* Karartma */}
        <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'linear-gradient(to top, #141414 10%, transparent 90%)'}}></div>
        
        <div style={{ maxWidth: '700px', position:'relative', zIndex:2 }}>
          <h1 style={{ fontSize: '60px', fontWeight: 'bold', marginBottom: '20px', textShadow:'2px 2px 10px black', lineHeight:'1.1' }}>{heroMovie.title}</h1>
          <p style={{ fontSize: '16px', marginBottom: '25px', textShadow:'1px 1px 2px black', color:'#ddd' }}>
              {heroMovie.overview ? heroMovie.overview.substring(0, 200)+'...' : 'Bu film şu an çok popüler.'}
          </p>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to={`/content/movie/${heroMovie.id}`} style={{ background: 'white', color: 'black', padding: '12px 35px', borderRadius: '4px', fontWeight: 'bold', textDecoration:'none', display:'flex', alignItems:'center', gap:'10px', fontSize:'18px' }}>
              <FaPlay /> Oynat
            </Link>
            <Link to={`/content/movie/${heroMovie.id}`} style={{ background: 'rgba(109, 109, 110, 0.7)', color: 'white', padding: '12px 35px', borderRadius: '4px', fontWeight: 'bold', textDecoration:'none', display:'flex', alignItems:'center', gap:'10px', fontSize:'18px' }}>
              <FaInfoCircle /> Daha Fazla Bilgi
            </Link>
          </div>
        </div>
      </div>
      )}

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', position:'relative', zIndex:10, marginTop:'-60px' }}>
        
        {/* 2. PAYLAŞIM KUTUSU */}
        <div style={{ background: '#262626', padding: '15px', borderRadius: '8px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #333' }}>
          <img 
            src={user.avatar || 'https://via.placeholder.com/40'} 
            style={{width:'45px', height:'45px', borderRadius:'50%', border:'2px solid #e50914', objectFit:'cover'}} 
            onError={(e) => {e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=random`}}
          />
          <Link to="/share" style={{ flex: 1, background: '#121212', color: '#aaa', padding: '12px 20px', borderRadius: '30px', textDecoration: 'none', fontSize: '15px', display:'flex', alignItems:'center', gap:'10px', border:'1px solid #333', transition:'0.2s' }}>
            <FaSearch /> Ne izledin veya okudun? Paylaş...
          </Link>
          <Link to="/share" style={{color:'#ccc'}}><FaImage size={24}/></Link>
        </div>

        {/* 3. SOSYAL AKIŞ (SOL KOLON) */}
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            
            <div style={{ flex: 2, minWidth: '300px' }}>
                <h3 style={{ borderLeft: '4px solid #e50914', paddingLeft: '15px', marginBottom: '20px' }}>Zaman Tüneli</h3>
                
                {posts.length === 0 ? (
                    <div style={{textAlign:'center', padding:'30px', background:'#222', borderRadius:'8px', color:'#777'}}>Henüz akışta bir şey yok. Arkadaşlarını takip et!</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {posts.map((act) => {
                            // Beğeni kontrolü
                            const isLiked = act.Likes?.some(l => l.UserId === user.id);
                            
                            return (
                            <div key={act.id || act.createdAt} style={{ background: '#181818', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                                
                                {/* HEADER */}
                                <div style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #222' }}>
                                    <Link to={`/profile/${act.User?.id}`}>
                                        <img src={act.User?.avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit:'cover' }} onError={(e)=>{e.target.src=`https://ui-avatars.com/api/?name=${act.User?.username}&background=random`}}/>
                                    </Link>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{act.User?.username}</div>
                                        <div style={{ fontSize: '12px', color: '#888' }}>{new Date(act.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                {/* İÇERİK */}
                                {act.caption ? (
                                    // RESİMLİ POST
                                    <div>
                                        {act.imageUrl && <img src={act.imageUrl} style={{ width: '100%', maxHeight:'500px', objectFit: 'contain', background:'black' }} onError={(e)=>{e.target.src='https://placehold.co/600x400/333/FFF?text=Resim+Yok'}}/>}
                                        <div style={{ padding: '15px' }}>
                                            <p style={{ fontSize: '15px', margin: 0 }}>{act.caption}</p>
                                        </div>
                                    </div>
                                ) : (
                                    // FİLM AKTİVİTESİ
                                    <div style={{ display: 'flex', background: '#222' }}>
                                        <Link to={`/content/${act.Content?.type}/${act.Content?.external_id}`}>
                                            <img src={act.Content?.poster_path} style={{ width: '100px', height: '150px', objectFit: 'cover' }} onError={(e)=>{e.target.src='https://placehold.co/100x150/333/FFF?text=Poster'}}/>
                                        </Link>
                                        <div style={{ padding: '15px', flex: 1 }}>
                                            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '5px' }}>
                                                {act.status === 'watched' ? 'şunu izledi:' : 'listesine ekledi:'}
                                            </div>
                                            <Link to={`/content/${act.Content?.type}/${act.Content?.external_id}`} style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', textDecoration: 'none', display:'block', marginBottom:'10px' }}>
                                                {act.Content?.title}
                                            </Link>
                                            {act.rating > 0 && <div style={{color:'#46d369', fontWeight:'bold', fontSize:'14px', marginBottom:'8px'}}>★ {act.rating}/10</div>}
                                            {act.review && <div style={{ background: '#333', padding: '10px', borderRadius: '6px', fontSize: '13px', fontStyle: 'italic', color: '#ccc' }}>"{act.review}"</div>}
                                        </div>
                                    </div>
                                )}

                                {/* FOOTER (BEĞENİ & YORUM) */}
                                <div style={{ padding: '10px 15px', borderTop: '1px solid #222' }}>
                                    <div style={{display:'flex', gap:'20px', marginBottom:'10px'}}>
                                        <button onClick={() => handleLike(act.id)} style={{background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', color: isLiked ? '#e50914':'#aaa', fontSize:'14px'}}>
                                            {isLiked ? <FaHeart size={20}/> : <FaRegHeart size={20}/>} {act.Likes?.length || 0}
                                        </button>
                                        <div style={{color:'#aaa', display:'flex', alignItems:'center', gap:'5px', fontSize:'14px'}}>
                                            <FaRegComment size={20}/> {act.Comments?.length || 0}
                                        </div>
                                    </div>

                                    {/* Yorumlar Listesi */}
                                    {act.Comments && act.Comments.length > 0 && (
                                        <div style={{marginBottom:'10px', maxHeight:'100px', overflowY:'auto'}}>
                                            {act.Comments.map(c => (
                                                <div key={c.id} style={{fontSize:'13px', marginBottom:'3px'}}>
                                                    <span style={{fontWeight:'bold', marginRight:'5px'}}>{c.User?.username}:</span>
                                                    <span style={{color:'#ccc'}}>{c.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Yorum Yap */}
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <input 
                                            type="text" 
                                            placeholder="Yorum yaz..." 
                                            value={commentText[act.id] || ''}
                                            onChange={(e) => setCommentText({...commentText, [act.id]: e.target.value})}
                                            style={{flex:1, background:'#222', border:'none', borderRadius:'20px', padding:'8px 15px', color:'white', outline:'none', fontSize:'13px'}}
                                        />
                                        <button onClick={() => handleComment(act.id)} style={{background:'transparent', border:'none', color:'#0095f6', cursor:'pointer'}}>
                                            <FaPaperPlane size={18} />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        );})}
                    </div>
                )}
            </div>

            {/* --- 4. FİLM LİSTELERİ (SAĞ KOLON / VEYA ALTTA) --- */}
        </div>

        <div style={{ marginTop: '60px' }}>
            {Object.entries(categories).map(([title, movies]) => (
            <div key={title} style={{ marginBottom: '40px' }}>
                <h3 style={{ color: '#e5e5e5', marginBottom: '15px', fontSize: '20px', fontWeight:'bold' }}>{title}</h3>
                <div style={{ display: 'flex', overflowX: 'auto', gap: '10px', paddingBottom: '10px', scrollbarWidth: 'none', scrollBehavior:'smooth' }}>
                {movies.map(movie => (
                    <Link to={`/content/movie/${movie.id}`} key={movie.id} style={{ flex: '0 0 auto', transition: 'transform 0.3s', position:'relative' }}>
                    <img 
                        src={movie.poster_path} 
                        alt={movie.title} 
                        style={{ width: '160px', borderRadius: '4px', cursor: 'pointer' }}
                        onError={(e)=>{e.target.src='https://placehold.co/160x240/333/FFF?text=Poster'}}
                    />
                    </Link>
                ))}
                </div>
            </div>
            ))}
        </div>

      </div>
    </div>
  );
}
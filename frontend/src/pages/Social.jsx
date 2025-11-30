import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaRegComment, FaPaperPlane, FaImage, FaSearch, FaStar, FaQuoteLeft, FaArrowDown, FaTrash } from 'react-icons/fa';

export default function Social() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [socialFeed, setSocialFeed] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(false);
  
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if(user) fetchFeed(1);
  }, []);

  const fetchFeed = async (pageNum) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/users/feed/${user.id}?page=${pageNum}`);
      if (res.data.length === 0) {
          setHasMore(false);
      } else {
          if (pageNum === 1) setSocialFeed(res.data);
          else setSocialFeed(prev => [...prev, ...res.data]);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const loadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
  };


  const handleLike = async (postId) => {
      try {
          await axios.post('http://localhost:5000/api/users/like', { userId: user.id, postId });
          
          setSocialFeed(prev => prev.map(post => {
              if(post.id === postId) {
                  const isLiked = post.Likes.some(l => l.UserId === user.id);
                  if(isLiked) post.Likes = post.Likes.filter(l => l.UserId !== user.id);
                  else post.Likes.push({ UserId: user.id });
              }
              return post;
          }));
      } catch(e) { alert('Hata'); }
  };

  const handleComment = async (postId) => {
      if(!commentText[postId]) return;
      try {
          const res = await axios.post('http://localhost:5000/api/users/comment', { userId: user.id, postId, text: commentText[postId] });
          setCommentText({...commentText, [postId]: ''});
          
          
          setSocialFeed(prev => prev.map(post => {
              if(post.id === postId) {
                  if(!post.Comments) post.Comments = [];
                  post.Comments.unshift(res.data); 
              }
              return post;
          }));
      } catch(e) { alert('Hata'); }
  };

  
  const handleDeleteComment = async (commentId, postId) => {
      if(!window.confirm("Yorumu silmek istiyor musun?")) return;
      try {
          await axios.delete(`http://localhost:5000/api/users/comment/${commentId}`);
          
          
          setSocialFeed(prev => prev.map(post => {
              if(post.id === postId) {
                  post.Comments = post.Comments.filter(c => c.id !== commentId);
              }
              return post;
          }));
      } catch(e) { alert('Silinemedi.'); }
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

  if (!user) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Giriş Yapmalısın</div>;

  return (
    <div style={{ background: '#141414', minHeight: '100vh', padding: '40px 20px', color:'white' }}>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <h2 style={{ borderLeft: '5px solid #e50914', paddingLeft: '15px', marginBottom: '30px' }}>Zaman Tüneli</h2>

        {/* PAYLAŞIM KUTUSU */}
        <div style={{ background: '#262626', padding: '20px', borderRadius: '12px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #333' }}>
          <img src={user.avatar} style={{width:'50px', height:'50px', borderRadius:'50%', border:'2px solid #e50914', objectFit:'cover'}} onError={(e)=>{e.target.src='https://placehold.co/50x50/333/FFF?text=User'}} />
          <Link to="/share" style={{ flex: 1, background: '#121212', color: '#aaa', padding: '15px 20px', borderRadius: '30px', textDecoration: 'none', fontSize: '15px', display:'flex', alignItems:'center', gap:'10px', border:'1px solid #333' }}>
            <FaSearch /> Ne izledin veya okudun? Paylaş...
          </Link>
        </div>

        {/* AKIŞ LİSTESİ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {socialFeed.map((act) => {
                const isLiked = act.Likes?.some(l => l.UserId === user.id);
                
                return (
                    <div key={act.id} style={{ background: '#181818', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                        
                        {/* HEADER */}
                        <div style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #222' }}>
                            <Link to={`/profile/${act.User?.id}`}><img src={act.User?.avatar} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit:'cover', border:'2px solid #e50914' }} onError={(e)=>{e.target.src='https://placehold.co/45x45/333/FFF?text=User'}} /></Link>
                            <div>
                                <div style={{ fontSize: '15px' }}>
                                    <span style={{ fontWeight: 'bold', color:'white' }}>{act.User?.username}</span>
                                    <span style={{ color: '#aaa', marginLeft:'5px' }}>{getActionText(act)}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{timeAgo(act.updatedAt || act.createdAt)}</div>
                            </div>
                        </div>

                        {/* BODY */}
                        <div style={{ padding: '0' }}>
                            {act.Content ? (
                                <div style={{ display: 'flex', padding: '20px', gap: '20px' }}>
                                    <Link to={`/content/${act.Content.type}/${act.Content.external_id}`} style={{flexShrink:0}}>
                                        <img src={act.Content.poster_path} style={{ width: '120px', borderRadius: '8px', boxShadow:'0 4px 15px rgba(0,0,0,0.7)' }} onError={(e)=>{e.target.src='https://placehold.co/120x180/333/FFF?text=Poster'}} />
                                    </Link>
                                    <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center'}}>
                                        <Link to={`/content/${act.Content.type}/${act.Content.external_id}`} style={{ fontSize: '22px', fontWeight: 'bold', color: 'white', textDecoration: 'none', display:'block', marginBottom:'5px' }}>{act.Content.title}</Link>
                                        <div style={{fontSize:'13px', color:'#888', marginBottom:'15px'}}>{act.Content.release_date?.substring(0,4)} • {act.Content.type === 'movie' ? 'Film' : 'Kitap'}</div>
                                        
                                        {act.rating > 0 && (
                                            <div style={{display:'inline-flex', alignItems:'center', gap:'10px', background:'#252525', padding:'8px 12px', borderRadius:'6px', width:'fit-content', marginBottom:'10px'}}>
                                                <div style={{display:'flex', gap:'2px'}}>{[...Array(5)].map((_, i) => ( <FaStar key={i} color={i < Math.round(act.rating/2) ? "#e50914" : "#444"} size={18}/> ))}</div>
                                                <span style={{fontWeight:'bold', fontSize:'16px', color:'#fff'}}>{act.rating}/10</span>
                                            </div>
                                        )}

                                        {act.review && (
                                            <div style={{ marginTop:'10px', position:'relative', paddingLeft:'15px', borderLeft:'3px solid #e50914' }}>
                                                <p style={{ margin: '0', fontSize: '15px', fontStyle: 'italic', color: '#ccc', lineHeight:'1.5' }}>
                                                    {act.review.length > 150 ? act.review.substring(0, 150) + '...' : act.review}
                                                </p>
                                                {act.review.length > 150 && ( <Link to={`/content/${act.Content.type}/${act.Content.external_id}`} style={{fontSize:'12px', color:'#e50914', display:'block', marginTop:'5px', fontWeight:'bold'}}>devamını oku &rarr;</Link> )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {act.imageUrl && <img src={act.imageUrl} style={{ width: '100%', maxHeight:'500px', objectFit: 'contain', background:'black' }} onError={(e)=>{e.target.src='https://placehold.co/600x400/333/FFF?text=Resim+Yok'}} />}
                                    <div style={{ padding: '15px' }}><p style={{ fontSize: '15px', margin: 0, lineHeight:'1.5' }}>{act.caption}</p></div>
                                </div>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid #222', background:'#1a1a1a' }}>
                            <div style={{display:'flex', gap:'20px', marginBottom:'15px'}}>
                                <button onClick={() => handleLike(act.id)} style={{background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', color: isLiked ? '#e50914':'#aaa', fontSize:'14px', fontWeight:'bold'}}>
                                    {isLiked ? <FaHeart size={20}/> : <FaRegHeart size={20}/>} Beğen <span style={{fontWeight:'normal'}}>({act.Likes?.length || 0})</span>
                                </button>
                                <div style={{color:'#aaa', display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', fontWeight:'bold'}}>
                                    <FaRegComment size={20}/> Yorum Yap <span style={{fontWeight:'normal'}}>({act.Comments?.length || 0})</span>
                                </div>
                            </div>

                            {/* Yorumlar Listesi */}
                            {act.Comments && act.Comments.length > 0 && (
                                <div style={{marginBottom:'15px', background:'#222', padding:'10px', borderRadius:'6px'}}>
                                    {act.Comments.slice(0,3).map(c => (
                                        <div key={c.id} style={{fontSize:'13px', marginBottom:'5px', display:'flex', justifyContent:'space-between'}}>
                                            <div>
                                                <span style={{fontWeight:'bold', color:'white', marginRight:'5px'}}>{c.User?.username}:</span>
                                                <span style={{color:'#ccc'}}>{c.text}</span>
                                            </div>
                                            
                                            {/* YORUM SİLME BUTONU (Sadece Kendi Yorumunsa) */}
                                            {c.User?.id === user.id && (
                                                <button onClick={() => handleDeleteComment(c.id, act.id)} style={{background:'transparent', border:'none', color:'#777', cursor:'pointer'}}>
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {act.Comments.length > 3 && <div style={{fontSize:'11px', color:'#666', marginTop:'5px'}}>Tüm yorumları gör...</div>}
                                </div>
                            )}

                            {/* Yorum Ekle */}
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
                );
            })}
        </div>

        {/* --- DAHA FAZLA YÜKLE BUTONU --- */}
        {hasMore ? (
            <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
                <button onClick={loadMore} disabled={loading} style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '12px 30px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', display:'inline-flex', alignItems:'center', gap:'10px' }}>
                    {loading ? 'Yükleniyor...' : <>Daha Fazla Göster <FaArrowDown/></>}
                </button>
            </div>
        ) : (
            socialFeed.length > 0 && <p style={{textAlign:'center', color:'#555', marginTop:'40px'}}>Tüm gönderileri gördün! 🎉</p>
        )}

      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilm, FaBook, FaUser, FaStar, FaFilter, FaFire, FaTrophy, FaTimes, FaClock } from 'react-icons/fa';


const MOVIE_GENRES = [
  { id: 28, name: "Aksiyon" }, { id: 12, name: "Macera" }, { id: 16, name: "Animasyon" },
  { id: 35, name: "Komedi" }, { id: 80, name: "Suç" }, { id: 99, name: "Belgesel" },
  { id: 18, name: "Dram" }, { id: 10751, name: "Aile" }, { id: 14, name: "Fantastik" },
  { id: 27, name: "Korku" }, { id: 10749, name: "Romantik" }, { id: 878, name: "Bilim Kurgu" },
  { id: 10770, name: "TV Filmi" }, { id: 53, name: "Gerilim" }, { id: 10752, name: "Savaş" },
  { id: 37, name: "Vahşi Batı" }
];


const BOOK_SUBJECTS = [
  { id: "fiction", name: "Kurgu / Roman" },
  { id: "fantasy", name: "Fantastik" },
  { id: "romance", name: "Romantik" },
  { id: "history", name: "Tarih" },
  { id: "science", name: "Bilim" },
  { id: "biography", name: "Biyografi" },
  { id: "horror", name: "Korku" },
  { id: "mystery", name: "Gizem" },
  { id: "poetry", name: "Şiir" }
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [type, setType] = useState('movie'); 
  const [loading, setLoading] = useState(false);
  
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ year: '', rating: '', genre: '', orderBy: 'relevance' });
  
  
  const [showcase, setShowcase] = useState({ 
      popularMovies: [], topRatedMovies: [],
      popularBooks: [], newestBooks: [] 
  });

  useEffect(() => { loadShowcase(); }, []);
  
  useEffect(() => { 
      setResults([]); 
      setFilters({ year:'', rating:'', genre:'', orderBy:'relevance' }); 
      setQuery('');
  }, [type]);

  const loadShowcase = async () => {
    try {
      
      const [popM, topM, popB, newB] = await Promise.all([
          axios.get('http://localhost:5000/api/movies/popular'),
          axios.get('http://localhost:5000/api/movies/top_rated'),
          axios.get('http://localhost:5000/api/books/popular').catch(()=>({data:[]})),
          axios.get('http://localhost:5000/api/books/newest').catch(()=>({data:[]}))
      ]);

      setShowcase({
          popularMovies: popM.data.slice(0, 12),
          topRatedMovies: topM.data.slice(0, 12),
          popularBooks: popB.data ? popB.data.slice(0, 12) : [],
          newestBooks: newB.data ? newB.data.slice(0, 12) : []
      });
    } catch (e) { console.error(e); }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      let endpoint;
      let params = {};

      if (type === 'movie') {
          if ((filters.year || filters.rating || filters.genre) && !query.trim()) {
              endpoint = `http://localhost:5000/api/movies/discover`;
              params = { year: filters.year, vote_average: filters.rating, with_genres: filters.genre };
          } else {
              endpoint = `http://localhost:5000/api/movies/search`;
              params = { q: query };
          }
      } else if (type === 'book') {
          endpoint = `http://localhost:5000/api/books/search`;
          params = { q: query || 'best', subject: filters.genre, orderBy: filters.orderBy };
      } else {
          endpoint = `http://localhost:5000/api/users/search?q=${query}`;
      }

      const res = await axios.get(endpoint, { params });
      setResults(res.data);

    } catch (error) { console.error("Arama hatası", error); } 
    finally { setLoading(false); }
  };

  const clearFilters = () => { setFilters({ year: '', rating: '', genre: '', orderBy: 'relevance' }); setQuery(''); setResults([]); };

  return (
    <div className="container" style={{ color: 'white', paddingTop: '40px', maxWidth: '1200px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto 40px auto' }}>
        
        {/* TÜR SEÇİMİ */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', justifyContent: 'center' }}>
          <button onClick={() => setType('movie')} style={tabStyle(type === 'movie')}><FaFilm /> Filmler</button>
          <button onClick={() => setType('book')} style={tabStyle(type === 'book')}><FaBook /> Kitaplar</button>
          <button onClick={() => setType('user')} style={tabStyle(type === 'user')}><FaUser /> Kullanıcılar</button>
        </div>

        {/* ARAMA ALANI */}
        <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
            <form onSubmit={handleSearch} style={{ position: 'relative', flex:1 }}>
                <FaSearch style={{ position: 'absolute', left: '20px', top: '18px', color: '#aaa', fontSize: '20px' }} />
                <input 
                    type="text" 
                    placeholder={type === 'movie' ? "Film ara..." : "Kitap veya Kişi ara..."} 
                    value={query} onChange={(e) => setQuery(e.target.value)} 
                    style={{ width: '100%', padding: '15px 20px 15px 60px', fontSize: '18px', background: '#141414', border: '1px solid #444', color: 'white', borderRadius: '4px', outline: 'none', boxSizing:'border-box', opacity: (filters.year || filters.rating || filters.genre) ? 0.5 : 1 }} 
                />
            </form>
            
            {/* FİLTRE BUTONU */}
            {(type === 'movie' || type === 'book') && (
                <button onClick={() => setShowFilters(!showFilters)} style={{ background: showFilters ? '#e50914' : '#333', color:'white', border:'1px solid #444', borderRadius:'4px', padding:'0 25px', height:'54px', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', fontSize:'16px' }}> 
                    <FaFilter /> Filtrele 
                </button>
            )}
            <button onClick={handleSearch} style={{background:'#e50914', color:'white', border:'none', borderRadius:'4px', padding:'0 30px', height:'54px', cursor:'pointer', fontWeight:'bold', fontSize:'16px'}}>ARA</button>
        </div>

        {/* FİLTRE PANELİ */}
        {showFilters && (
            <div style={{marginTop:'15px', background:'#1f1f1f', padding:'20px', borderRadius:'8px', border:'1px solid #333', display:'flex', flexWrap:'wrap', gap:'20px', alignItems:'end'}}>
                
                {/* FİLM FİLTRELERİ */}
                {type === 'movie' && (
                    <>
                        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}><label style={{fontSize:'12px', color:'#aaa'}}>Yıl</label><input type="number" placeholder="2024" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} style={{background:'#141414', border:'1px solid #444', color:'white', padding:'8px', borderRadius:'4px', width:'100px'}} /></div>
                        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}><label style={{fontSize:'12px', color:'#aaa'}}>Min Puan</label><select value={filters.rating} onChange={e => setFilters({...filters, rating: e.target.value})} style={{background:'#141414', border:'1px solid #444', color:'white', padding:'8px', borderRadius:'4px', width:'150px'}}><option value="">Farketmez</option><option value="9">9+</option><option value="8">8+</option><option value="7">7+</option></select></div>
                        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}><label style={{fontSize:'12px', color:'#aaa'}}>Tür</label><select value={filters.genre} onChange={e => setFilters({...filters, genre: e.target.value})} style={{background:'#141414', border:'1px solid #444', color:'white', padding:'10px', borderRadius:'4px', width:'180px'}}><option value="">Tümü</option>{MOVIE_GENRES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
                    </>
                )}

                {/* KİTAP FİLTRELERİ */}
                {type === 'book' && (
                    <>
                        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}><label style={{fontSize:'12px', color:'#aaa'}}>Konu / Tür</label><select value={filters.genre} onChange={e => setFilters({...filters, genre: e.target.value})} style={{background:'#141414', border:'1px solid #444', color:'white', padding:'8px', borderRadius:'4px', width:'200px'}}><option value="">Tümü</option>{BOOK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}><label style={{fontSize:'12px', color:'#aaa'}}>Sıralama</label><select value={filters.orderBy} onChange={e => setFilters({...filters, orderBy: e.target.value})} style={{background:'#141414', border:'1px solid #444', color:'white', padding:'8px', borderRadius:'4px', width:'150px'}}><option value="relevance">Alaka Düzeyi</option><option value="newest">En Yeni</option></select></div>
                    </>
                )}

                <button onClick={clearFilters} style={{background:'transparent', border:'1px solid #555', color:'#aaa', padding:'10px 20px', borderRadius:'4px', cursor:'pointer', marginLeft:'auto', display:'flex', alignItems:'center', gap:'5px'}}><FaTimes /> Temizle</button>
            </div>
        )}
      </div>

      {/* --- VİTRİNLER (ARAMA YOKSA GÖSTERİLİR - EKLENDİ) --- */}
      {!loading && results.length === 0 && !query && !filters.year && !filters.rating && !filters.genre && (
          <div style={{marginTop:'30px'}}>
              
              {/* FİLM VİTRİNİ */}
              {type === 'movie' && (
                  <>
                      <div style={{marginBottom:'50px'}}>
                          <h3 style={{display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #333', paddingBottom:'10px'}}><FaFire color="orange"/> En Popüler Filmler</h3>
                          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'20px'}}>
                              {showcase.popularMovies.map(m => <MovieCard key={m.id} item={m} type="movie" />)}
                          </div>
                      </div>
                      <div>
                          <h3 style={{display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #333', paddingBottom:'10px'}}><FaTrophy color="gold"/> IMDb Zirvesi</h3>
                          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'20px'}}>
                              {showcase.topRatedMovies.map(m => <MovieCard key={m.id} item={m} type="movie" />)}
                          </div>
                      </div>
                  </>
              )}

              {/* KİTAP VİTRİNİ */}
              {type === 'book' && (
                  <>
                      <div style={{marginBottom:'50px'}}>
                          <h3 style={{display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #333', paddingBottom:'10px'}}><FaBook color="#e50914"/> Çok Okunanlar</h3>
                          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'20px'}}>
                              {showcase.popularBooks.map(b => <MovieCard key={b.id} item={b} type="book" />)}
                          </div>
                      </div>
                      <div>
                          <h3 style={{display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid #333', paddingBottom:'10px'}}><FaClock color="orange"/> Yeni Çıkanlar</h3>
                          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'20px'}}>
                              {showcase.newestBooks.map(b => <MovieCard key={b.id} item={b} type="book" />)}
                          </div>
                      </div>
                  </>
              )}
          </div>
      )}

      {/* --- ARAMA SONUÇLARI --- */}
      {loading ? <div style={{textAlign:'center', marginTop:'50px', fontSize:'20px', color:'#777'}}>Yükleniyor...</div> : (
        <div className="search-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {results.map((item) => (
            type === 'user' ? (
              <Link to={`/profile/${item.id}`} key={item.id} style={{ textDecoration:'none', color:'white', background:'#222', padding:'25px', borderRadius:'8px', textAlign:'center' }}>
                <img src={item.avatar || 'https://via.placeholder.com/100'} style={{width:'90px', height:'90px', borderRadius:'50%', objectFit:'cover'}} onError={(e)=>{e.target.src=`https://ui-avatars.com/api/?name=${item.username}&background=random`}}/>
                <h3 style={{margin:'10px 0'}}>{item.username}</h3>
              </Link>
            ) : <MovieCard key={item.id} item={item} type={type} />
          ))}
        </div>
      )}
      
      {!loading && results.length === 0 && (query !== '' || filters.year || filters.rating || filters.genre) && <div style={{textAlign:'center', color:'#555'}}>Sonuç yok.</div>}
    </div>
  );
}

const MovieCard = ({ item, type }) => (
    <Link to={`/content/${type}/${item.id}`} className="movie-card" style={{textDecoration:'none'}}>
        <div style={{position:'relative', borderRadius:'4px', overflow:'hidden', background:'#1f1f1f'}}>
            <img src={item.poster_path || item.cover_image} onError={(e) => {e.target.src = 'https://placehold.co/300x450/333/FFF?text=Resim+Yok'}} style={{width:'100%', aspectRatio:'2/3', objectFit:'cover', display:'block'}} />
            <div style={{padding:'10px'}}>
                <h4 style={{margin:'0 0 5px 0', color:'white', fontSize:'14px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{item.title}</h4>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#aaa'}}>
                    <span>{item.release_date?.substring(0,4) || item.publishedDate?.substring(0,4)}</span>
                    {item.vote_average > 0 && <span style={{color:'#46d369', fontWeight:'bold'}}>★ {item.vote_average?.toFixed(1)}</span>}
                </div>
            </div>
        </div>
    </Link>
);

const tabStyle = (isActive) => ({
  background: isActive ? '#e50914' : '#333', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '50px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: '0.3s', opacity: isActive ? 1 : 0.7
});
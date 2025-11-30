import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import ContentDetail from './pages/ContentDetail';
import Search from './pages/Search'; 
import Navbar from './components/Navbar'; 
import CreatePost from './pages/CreatePost';
import Social from './pages/Social';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
function Layout({ children }) {
  const location = useLocation();
  
  const hideNavbar = location.pathname === '/' || location.pathname === '/register';
  
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/search" element={<Search />} /> {/* <-- YENİ ROTA */}
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/content/:type/:id" element={<ContentDetail />} />
          <Route path="/social" element={<Social />} />
          <Route path="/share" element={<CreatePost />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;


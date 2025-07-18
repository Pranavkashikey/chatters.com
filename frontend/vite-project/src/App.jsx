import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route,Routes } from 'react-router-dom';



import Login from "./Login/Login"
import Register from "./Register/Register"

import './index.css'
import Home from './Home/Home';
import { VerifyUser } from './utils/VerifyUser';
import Footer from './Footer/Footer';
import ProfilePage from './Profile/Profile';
import VideoCall from './WEBRTC/VideoCall';
import Contact from './Footer/Contact';
import AdminDashboard from './Admin/Admin';
import AdminRoute from './routes/AdminRoute';
// import { ToastContainer } from 'react-toastify';



function App() {
  

  return (
    <>
    
      <div>
        <Routes>
        
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/profile/:id" element={<ProfilePage/>}></Route>
          <Route path='/videoconference' element={<VideoCall/>}></Route>
          <Route path='/contact' element={<Contact/>}></Route>
          <Route element={<VerifyUser/>}>
          
          <Route path="/" element={<Home/>}/>
          <Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>

          </Route>
        </Routes>

        <Footer/>

        
        
        <ToastContainer/>
      </div>
    </>
  )
}

export default App

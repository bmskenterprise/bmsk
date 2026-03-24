import { useState } from 'react';
import { Routes,Route } from 'react-router-dom';
import { MdOutlineMenu,MdClose } from "react-icons/md";
import { Container,Row,Col } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';
import { MdLightMode,MdDarkMode } from "react-icons/md";

import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import ResellerList from './components/ResellerList';
import Register from './components/Register';
import PrivateRoute from './routes/DashboardRoute';
import './App.css';
import {Flex,Header} from './components/styles/Admin.style';
import ManageDrive from './components/ManageDrive';
import ModemList from './components/ModemList';
import Notice from './components/ManageNotice';
import { ThemeProvider } from './contexts/ThemeContext';
//CDK9I7WULV01788353710 react-bootstrapuuid
function App() {
  const [sidebarToggler, setSidebarToggler] = useState(true);
  const [dark, setDark] = useState(true);

  return (
    <ThemeProvider>
      <Container>
      <Row>
      <Col xs={3}>
      <Sidebar sidebarToggler={sidebarToggler} />
      </Col>
      <Col xs={9}>
        <Header href="" target="">
          <div href="" target="">
            <span onClick={e=>setSidebarToggler(!sidebarToggler)}>{sidebarToggler?<MdClose src={reactLogo} className=" " alt=" " />:
            <MdOutlineMenu src={viteLogo} className="logo" alt=" " />}</span>
          </div>
          <div><span onClick={e=>{setDark(!dark)}}>{dark?<MdLightMode />:<MdDarkMode />}</span></div>
        </Header>
        {/* <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button> */}
        <div style={{paddingLeft: '2rem'}}>
      <Routes>
        <Route path='login' element={<Login/>}></Route>
        <Route path='/*' element={<PrivateRoute />}>
          <Route path='dashboard' element={<Dashboard/>} />
          <Route path='resellers' element={<ResellerList/>} />
          <Route path='resellers/add' element={<Register/>} />
          <Route path='drive-package/' element={<DrivePackage/>} >
            <Route path=':id' element={<ManageDrive/>}></Route>
          </Route>
          <Route path='recharge-history/all' element={<All/>} />
          <Route path='recharge-history/flexiload' element={<Flexiload/>} />
          <Route path='recharge-history/internet' element={<internet/>} />
          <Route path='payment-history/internet' element={<internet/>} />
          <Route path='-/modem' element={<ModemList/>} />
          <Route path='admin-/profile' element={<Profile/>} />
          <Route path='/notice' element={<Notice/>} />
          <Route path='/appearance-setting' element={<Appearance/>} />
        </Route>
      </Routes>
          {/* Edit <code>src/App.jsx</code>     HMR */}
        </div>
      </Col>
      {/* <ToastContainer  autoClose={3000}>
      </ToastContainer> */}
      </Row>           
    </Container>
    </ThemeProvider>
  )
}

export default App

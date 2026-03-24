import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
//import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-toastify/dist/ReactToastify.css';
import {ThemeProvider} from './contexts/ThemeContext';
import {AdminAuthProvider} from './contexts/AdminAuthContext.jsx';
import {NotificationProvider} from './contexts/NotificationContext'
import {SocketProvider} from './contexts/SocketContext'
//import {TelecomProvider} from './contexts/TelecomContext'
import {UserAuthProvider} from './contexts/UserAuthContext'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <UserAuthProvider>
        <AdminAuthProvider>
          <SocketProvider>
            <NotificationProvider>
              {/*<TelecomProvider>*/}
                <><App />
                <ToastContainer /></>
              {/*</TelecomProvider>*/}
            </NotificationProvider>
          </SocketProvider>
        </AdminAuthProvider>
      </UserAuthProvider>
    </ThemeProvider>
  </BrowserRouter>,
)

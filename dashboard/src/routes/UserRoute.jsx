import { Navigate, Outlet } from "react-router-dom";
import {UserNotificationProvider} from '../contexts/UserNotificationContext';
import {useUserAuth} from '../contexts/UserAuthContext';
import Layout from '../Layout/User/Layout';

export default () => {
    const { authentic } = useUserAuth();
    return authentic? <UserNotificationProvider><Layout><Outlet /></Layout></UserNotificationProvider> : <Navigate to='/user/login' />
}

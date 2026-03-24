import React,{useContext} from 'react';
import {Navigate,Outlet} from "react-router-dom";
import {TelecomProvider} from '../contexts/TelecomContext'
import {useAdminAuth} from '../contexts/AdminAuthContext';
import Layout from '../Layout/dashboard/Layout';

export default () => {
    //const { authentic } = useAdminAuth();
    return /*authentic?*/ <TelecomProvider><Layout><Outlet /></Layout></TelecomProvider>/* : <Navigate to='/login' />*/
}

/*import authRoute from './user.route.js';
import adminRoute from './admin.route.js';*/
import dashboardRoute from './dashboard.route.js';
import userRoute from './user.route.js';
/*import telecomRoute from '../routes/telecom.route.js';
import driveRoute from '../routes/drive.route.js';
import depositRoute from './deposit.route.js';
import feedbackRoute from './feedback.route.js';
import requestRoute from './request.route.js';*/

const routes = [
    /*{
        path: 'api/auth/user',
        controller: authRoute
    },
    {
        path: '/api/auth/admin',
        controller: adminRoute
    },*/
    {
        path: '/api/user',
        controller: userRoute
    },
    {
        path: '/api',
        controller: dashboardRoute
    },
    /*{
        path: '/api/drive-package',
        controller: driveRoute
    },
    {
        path: '/api/telecom',
        controller: telecomRoute
    },
    {
        path: '/api/deposit',
        controller: depositRoute
    },
    {
        path: '/api/feedback',
        controller: feedbackRoute
    },
    {
        path: '/api/request',
        controller: requestRoute
    },*/
]


export default app => {
    for(let route of routes){
        if(route.path=='/'){
            app.get(route.path, route.controller);
        }
        app.use(route.path, route.controller);
    }
}
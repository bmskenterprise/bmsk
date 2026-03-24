import { createContext,useContext,useEffect,useState } from "react";
//import url from '../config/url'
import {useSocket} from "./SocketContext";
const UserNotificationContext = createContext();

export const UserNotificationProvider = ({ children }) => {
  const [pendingCounts, setPendingCounts] = useState({topup:0,drive:0, regular:0,bill:0});
  //const [failedCounts, setFailedCounts] = useState({deposit:0,topup:0});
    const socket = useSocket();
   

  useEffect(() => {
    socket.emit('api-user:join', /*({type})*/ );
    socket.on('key-provided', ({type}) => {
      setPendingCounts(prev=> ({...prev,[type]:prev[type]+1}));
    });
    //socket.on('failed', (failed/*{type}*/) => {
      //setFailedCounts(failed/*prev=> ({...prev,[type]:prev[type]+1})*/);
    //});

    return () => {
      socket.off('key-provided');
      //socket.off('failed');
    };
  }, []);
      //setNotification(true);
      const reducePendingCounts = (type) => setPendingCounts(prev=> ({...prev,[type]:prev[type]-1})); // auto-hide
            
        
    
      return  <UserNotificationContext.Provider value={{pendingCounts,reducePendingCounts/*,failedCounts*/}}>{children}</UserNotificationContext.Provider>
    
}

export const useUserNotification = ()=> useContext(UserNotificationContext);
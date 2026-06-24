import { createContext,useContext,useEffect,useState } from "react";
import url from '../config/url'
import {useSocket} from "./SocketContext";
import {useAdminAuth} from "./AdminAuthContext";
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [isPending,setIsPending] = useState(false)// auto-hide
    const {socket} = useSocket();
    const {admin} = useAdminAuth();
    const [pendingCounts, setPendingCounts] = useState({deposit:0,withdraw:0,topup:0,drive:0, mbank:0,bill:0,user:0});
    const [failedCounts, setFailedCounts] = useState({deposit:0,topup:0});

    useEffect(()=>{
      if(!socket) return;
      //socket.emit('admin:join',admin.id/*({type})*/);
      const onAdd = ({type})=> {
        setPendingCounts(prev=> ({...prev,[type]:prev[type]+1}));
        setIsPending(true);
      }
      //const onFailed = (failed/*{type}*/)=> {
        //setFailedCounts(failed/*prev=> ({...prev,[type]:prev[type]+1})*/);
        //setIsPending(true);
      //}
      const onPending = (p) =>{
          setPendingCounts(p)  
      }
      socket.on('admin:pending', onPending)
    
      socket.on('added',onAdd);
      //socket.on('failed',onFailed);
      //const timer=setTimeout(()=>{setIsPending(false)},1000)

      return () => {
        socket.off('added',onAdd);
        /*socket.off('failed',onFailed);clearTimeout(timer);*/
      };
   },[socket]);
      //setNotification(true);
      const reducePendingCounts = (type) => setPendingCounts(prev=> ({...prev,[type]:0}));
      const seenPendings = ()=> setIsPending(false)
    
    return <NotificationContext.Provider value={{pendingCounts,reducePendingCounts,seenPendings,failedCounts,isPending}}>{children}</NotificationContext.Provider>
}

export const useNotification = ()=> useContext(NotificationContext);

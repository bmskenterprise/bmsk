import {createContext,useContext} from 'react';
import io from 'socket.io-client'
import url from '../config/url';

const socket = io(url.urlRoot,{
  transports: ['websocket', 'polling'], // ✅ Both transports
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
socket.on('connect', reason=> console.log(reason))
socket.on('connect_error', error=> console.log(error))
socket.on('reconnect', attemptNumber=> console.log(attemptNumber))
const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => {
  return <SocketContext.Provider value={{socket}}>{children}</SocketContext.Provider>;
}  //

export const useSocket = () => useContext(SocketContext);
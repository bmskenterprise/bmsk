import { useRef } from "react";

function useLongPress(check, ms = 500) {
  const timerRef = useRef(null);
let delay = 0;

  const start = (id) => {
    timerRef.current =  setInterval(()=>{
      delay+=10;
      if(delay>=ms){
        check(id);
        clearInterval(timerRef.current);
      }
    }, 10);;
  };

  const clear = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
    

  return {
     start,
     clear,
     check,
    /*onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,*/
  };
}
export default useLongPress;
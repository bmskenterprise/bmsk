import { useEffect,useState, } from 'react'
import {Navigate} from 'react-router-dom';
import {toast} from 'react-toastify';
//import { formatDistanceToNow } from 'date-fns';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import {useTheme} from '../../contexts/ThemeContext';
import {ScrollViewV,FlexH,GapV,Card,Loader,Spinner} from '../../components/styles/Admin.style';
import url from '../../config/url';// from "../lib/url";
import useFetch from '../../hooks/useFetch';

export default  () =>{
    const {admin} = useAdminAuth()
    const [loading,setLoading]=useState(false);
    const {modeData:{backPrimary,backSecondary,glassmorph},} = useTheme();
         //
    //const [pays, setPays] = useState([]);
    //const [depositSummary, setDepositSummary] = useState({'Topup Deposit':undefined,'Drive Deposit':undefined,'Bank Deposit':undefined});
    const  {data:telecomBalances} = useFetch(url.urlTelecomBalance);
    const  {data:expenseSummary} = useFetch(url.urlTodayExpenseSummary,data=>({'Topup Expense':data.todayTopupExpense,'Drive Expense':data.todayDriveExpense,'MBank Expense':data.todayMBankExpense}));
    const  {data:balanceSummary} = useFetch(url.urlBalanceSummary,data=>({'Main Balance':data.totalMainBalance,'Topup Balance':data.totalTopupBalance,'Drive Balance':data.totalDriveBalance,'MBank Balance':data.totalMBankBalance}));

    //if(!admin) <Navigate to='/login'/>// useRef(null);
    /*useEffect(() =>{
        fetchTodayDeposit();fetchTodayExpense();fetchBalance();fetchTelecomBalances()
        fetchData()    
        
        /*const handleOnline = () => toast.success('Internet Connected')
        const handleOffline = () => toast.error('Internet Disconnected')
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    },[])
                
        const fetchTodayDeposit = async ()=>{
            setLoading(true)
            try{
                let res = await fetch(url.urlTodayDepositSummary,{credentials:'include'})
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'Something went wrong');
                setDepositSummary({'Topup Deposit':data.todayTopupDeposit,'Drive Deposit':data.todayDriveDeposit,'Bank Deposit':data.todayBankDeposit});
            }catch(err) {toast.error(err.message);}
            finally{setLoading(false)}    
        }*/

            
            
            
                    
                    
                       
                   
             
            
        
        
            
            
            
                    
                    
                       
                   
             
            
        
         
        
        
                
                
                   
            
         
        
        

        /*const fetchData = async () => {
            try {
                let res = await fetch(url.urlDeposit,{credentials:'include'});
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'Something went wrong');
                setPays(data.transactions);
            }catch(err) {toast.error(err.message)}  
        }
    useEffect(() =>{
        socket.on('pack-added', (data) => {
            setPendings([data.currentPack, ...pendings]);
            bellRef.current.click();
        // setTimeout(() => setNotification(false), 3000); // auto-hide
        });
        return () => {
        };
    },[])*/
    return <ScrollViewV style={{/*background:backPrimary, padding:'1.5rem'*/width:'100%',height:'100%',position:'relative'}}>
        {/* <table>
            {pendings.map(d=><tr></tr>)}
        </table> */}
        {/*<button ref={bellRef} onClick={e=>{new Audio(audioFile).play()}} hidden></button>*/}
        <FlexH x='space-between' y='flex-start'>
            <Card style={{minHeight:'24rem',padding:'1rem'}} /*md={3}*/   >
                <h3 style={{background:backSecondary,borderRadius:'1rem 1rem 0 0'}}>Today's Usage</h3><GapV x='2'/>
                <ul>
                    {/*.map( => )*/ }
                </ul>
            </Card>
            <Card style={{minHeight:'24rem',padding:'1rem'}} /*md={3}*/   >
                <h3 style={{background:backSecondary,borderRadius:'1rem 1rem 0 0'}}>Topup Balances</h3><GapV x='2'/>
                <div>
                    {Object.keys(telecomBalances).map((t,i)=> <FlexH x='space-between' y='center' style={{marginTop:'1rem'}} key={i}><span>{t}</span><span>{telecomBalances[t]}</span></FlexH>)}
                </div>
            </Card>
            <Card style={{minHeight:'24rem',padding:'1rem'}} /*md={3}*/   >
                <h3 style={{background:backSecondary,borderRadius:'1rem 1rem 0 0'}}>Today's Report</h3><GapV x='2'/>
                <div /*style={{padding:'1rem'}}*/>
                    {/*Object.keys(depositSummary).map((f,i) => <div key={i} style={{marginTop:'1rem'}}>{f}<span style={{float:'right'}}>{depositSummary[f] && depositSummary[f]}</span></div>) */}
                    {Object.keys(expenseSummary).map((f,i) => <div key={i} style={{marginTop:'1rem'}}>{f}<span style={{float:'right'}}>{expenseSummary[f] && expenseSummary[f]}</span></div>) }
                </div>
            </Card>
            {/*<Col xs={12} md={3} style={{background:glassmorph.back, borderRadius:'1rem', boxShadow:glassmorph.shadow}}>
                <h3 style={{background:backSecondary,padding:'1rem', borderRadius:'1rem 1rem 0 0'}}>Last Payment</h3>
                <div style={{padding:'1rem'}}>
                    {pays.map((pays,i) => <div key={i}><span>{formatDistanceToNow(new Date(date), { addSuffix: true })}</span><br /><span>{user} ({type})</span><span style={{float:'right'}}>{amount}</span></div>) }
                </div>
            </Col>*/}
            <Card style={{minHeight:'24rem',padding:'1rem'}} /*md={3}*/   >
                <h3 style={{background:backSecondary,borderRadius:'1rem 1rem 0 0'}}>Total</h3><GapV x='2'/>
                <div /*style={{padding:'1rem'}}*/>
                    {Object.keys(balanceSummary).map((f,i) => <FlexH key={i} x='space-between' y='center' style={{marginTop:'1rem'}}><span>{f}</span><span>{balanceSummary[f]&& balanceSummary[f]}</span></FlexH>)}
                    {/*<FlexH x='space-between' y='center'><span>Bank Balance</span><span>{h}</span></FlexH>*/}
                </div>
            </Card>
        </FlexH>
        {loading && <Loader><Spinner></Spinner></Loader>}  
    </ScrollViewV>
}

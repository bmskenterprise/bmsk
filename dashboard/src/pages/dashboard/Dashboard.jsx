import React,{ useEffect,useState, } from "react"
import {Navigate} from 'react-router-dom';
import {Row,Col,} from 'react-bootstrap';
import {toast} from 'react-toastify';
//import { formatDistanceToNow } from 'date-fns';
import {useAdminAuth} from '../../contexts/AdminAuthContext';
import url from '../../config/url';// from "../lib/url";
import {useTheme} from '../../contexts/ThemeContext';
import {FlexH,ScrollViewV,Card,Loader,Spinner} from '../../components/styles/Admin.style';

export default  () =>{
    const {admin} = useAdminAuth()
    const [loading,setLoading]=useState(false);
    const [telecomBalances, setTelecomBalances] = useState({});
    const {modeData:{backPrimary,backSecondary,glassmorph},} = useTheme();
         //
    const [pays, setPays] = useState([]);
    const [depositSummary, setDepositSummary] = useState({'Topup Deposit':undefined,'Drive Deposit':undefined,'Bank Deposit':undefined});
    const [expenseSummary, setExpenseSummary] = useState({'Topup Expense':undefined,'Drive Expense':undefined,'Bank Expense':undefined});
    const [balanceSummary, setBalanceSummary] = useState({'Topup Balance':undefined,'Drive Balance':undefined,'Bank Balance':undefined});

    //if(!admin) <Navigate to='/login'/>// useRef(null);
    useEffect(() =>{
        fetchTodayDeposit();/*fetchTodayExpense();*/fetchBalance();fetchTelecomBalances()
        fetchData()    
        
        /*const handleOnline = () => toast.success('Internet Connected')
        const handleOffline = () => toast.error('Internet Disconnected')
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };*/
    },[])
                
        const fetchTodayDeposit = async ()=>{
            setLoading(true)
            try{
                let res = await fetch(url.urlTodayDepositSummary,{credentials:'include'}/*"http://localhost:5000/api/dashboard"*/)
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'Something went wrong');
                setDepositSummary({'Topup Deposit':data.todayTopupDeposit,'Drive Deposit':data.todayDriveDeposit,'Bank Deposit':data.todayBankDeposit});
            }catch(err) {toast.error(err.message);}
            finally{setLoading(false)}    
        }

        const fetchTodayExpense = async ()=>{
            setLoading(true)
            try{
                let res = await fetch(url.urlTodayExpenseSummary,{credentials:'include'}/*"http://localhost:5000/api/dashboard"*/)
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'Something went wrong');
                setExpenseSummary({'Topup Expense':data.todayTopupExpense,'Drive Expense':data.todayDriveExpense,'Bank Expense':data.todayBankExpense});
            }catch(err) {toast.error(err.message);}
            finally{setLoading(false)}
        }
        
        const fetchBalance = async ()=>{
            setLoading(true)
            try{
                let res = await fetch(url.urlBalanceSummary,{credentials:'include'}/*"http://localhost:5000/api/dashboard"*/)
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'Something went wrong');
                setBalanceSummary({'Topup Balance':data.totalTopupBalance,'Drive Balance':data.totalDriveBalance,'Bank Balance':data.totalBankBalance});
            }catch(err) {toast.error(err.message);}
            finally{setLoading(false)}
        }
    const fetchTelecomBalances = async () =>{
        setLoading(true)
        try{
            let res = await fetch(url.urlTelecomBalance,{credentials:'include'})
            let data = await res.json()
            if(!res.ok) throw new Error(data.error || 'Something went wrong');
            setTelecomBalances(data)
        }catch(err) {toast.error(err.message);}
        finally{setLoading(false)}
    }    

        const fetchData = async () => {
            try {
                let res = await fetch(url.urlDeposit,{credentials:'include'});
                let data = await res.json();
                if(!res.ok) throw new Error(data.error || 'Something went wrong');
                setPays(data.transactions);
            }catch(err) {toast.error(err.message)}  
        }
    /*useEffect(() =>{
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
            <Card /*xs={12} md={3}*/   >
                <h3 style={{background:backSecondary,padding:'1rem', borderRadius:'1rem 1rem 0 0'}}>Today's Usage</h3>
                <ul>
                    {/*.map( => )*/ }
                </ul>
            </Card>
            <Card /*xs={12} md={3}*/   >
                <h3>Topup Balances</h3>
                <div>
                    {Object.keys(telecomBalances).map((t,i)=> <FlexH x='space-between' y='center' style={{marginTop:'1rem'}} key={i}><span>{t}</span><span>{telecomBalances[t]}</span></FlexH>)}
                </div>
            </Card>
            <Card /*xs={12} md={3}*/   >
                <h3 style={{background:backSecondary,padding:'1rem', borderRadius:'1rem 1rem 0 0'}}>Today's Report</h3>
                <div style={{padding:'1rem'}}>
                    {Object.keys(depositSummary).map((f,i) => <div key={i} style={{marginTop:'1rem'}}>{f}<span style={{float:'right'}}>{depositSummary[f] && depositSummary[f]}</span></div>) }
                    {Object.keys(expenseSummary).map((f,i) => <div key={i} style={{marginTop:'1rem'}}>{f}<span style={{float:'right'}}>{expenseSummary[f] && expenseSummary[f]}</span></div>) }
                </div>
            </Card>
            {/*<Col xs={12} md={3} style={{background:glassmorph.back, borderRadius:'1rem', boxShadow:glassmorph.shadow}}>
                <h3 style={{background:backSecondary,padding:'1rem', borderRadius:'1rem 1rem 0 0'}}>Last Payment</h3>
                <div style={{padding:'1rem'}}>
                    {pays.map((pays,i) => <div key={i}><span>{formatDistanceToNow(new Date(date), { addSuffix: true })}</span><br /><span>{user} ({type})</span><span style={{float:'right'}}>{amount}</span></div>) }
                </div>
            </Col>*/}
            <Card /*xs={12} md={3}*/   >
                <h3 style={{background:backSecondary,padding:'1rem', borderRadius:'1rem 1rem 0 0'}}>Total</h3>
                <div style={{padding:'1rem'}}>
                    {Object.keys(balanceSummary).map((f,i) => <FlexH key={i} x='space-between' y='center' style={{marginTop:'1rem'}}><span>{f}</span><span>{balanceSummary[f]&& balanceSummary[f]}</span></FlexH>)}
                    {/*<FlexH x='space-between' y='center'><span>Bank Balance</span><span>{h}</span></FlexH>*/}
                </div>
            </Card>
        </FlexH>
        {loading && <Loader><Spinner></Spinner></Loader>}  
    </ScrollViewV>
}

import {useEffect,useState} from 'react';
import {toast} from 'react-toastify';
import {ScrollViewH,FlexH,GapV,Field,ThemeButton,Spinner} from '../../components/styles/Admin.style';
import {useTheme} from '../../contexts/ThemeContext';
import url from '../../config/url';
import SwitchItem from '../../components/Switch'
import AdminPIN from '../../components/AdminPIN';
const fields = ['Level','Bkash(topup)','DBBL(topup)','Nagad(topup)','Bkash(drive)','DBBL(drive)','Nagad(drive)','Bkash(mbank)','DBBL(mbank)','Nagad(mbank)','Topup(min/max)','Drive(min/max)','MBank(min/max)','Reg. Fee','Self Reg','OTP']

export default  () =>{
    const {thememode,modeData:{textPrimary}} = useTheme();
    let [formData,setFormData] = useState([]);
    const [depositSettings,setDepositSettings] = useState([]);
    const [loading,setLoading] = useState(false);
    const [depositMethod,setDepositMethod] = useState('') 
    useEffect(()=>{
        fetchDepositMethod()
        fetchDepositSettings();
    },[])
    const fetchDepositMethod = async () =>{
        try{
            let res = await fetch(url.urlDepositMethod,{credentials:'include'});
            let data = await res.json()
            if(!res.ok) throw new Error(data.error)
            setDepositMethod(data.depositMethod)
        }catch(e) {toast.error(e.message)}
    }
    const fetchDepositSettings = async ()=>{
        try {
            const res = await fetch(url.urlDepositRate,{credentials:'include'});
            const data = await res.json();
            if(!res.ok) throw new Error(data.error ||'');
            setFormData (data);
            setDepositSettings(data);
        }catch(err) {toast.error(err.message)}
    }
    const onSave = (e) => {
        e.preventDefault()
        AdminPIN(thememode,{cb:save,data:formData},'SAVE');
    }
    const save = async (formData,pin) =>{
        if(JSON.stringify(depositSettings)===JSON.stringify(formData)) {return toast.info('no change');}
        setLoading(true);
        try {
            const res = await fetch(url.urlDepositRate, {
                method: 'PATCH',
                credentials: 'include',
                headers: {'Content-Type':'application/json', 'x-admin-pin':pin},
                body: JSON.stringify(formData)
            })
            let data = await res.json();
            if(!res.ok) throw new Error(data.error ||'failed to save');
            toast.success('saved');
        }catch(err) {toast.error(err.message)}
        finally{setLoading(false)}
    }
    
    const changeDepositMethod = async e =>{
        try{
            let res = await fetch(`${url.urlDepositMethod}/${e.target.value}`,{method:'PATCH',credentials:'include'});
            let data = await res.json()
            if(!res.ok) throw new Error('failed to change')
            setDepositMethod(data.depositMethod);toast.success(data.message)
        }catch(e){toast.error(e.message)}
    }
    return <ScrollViewH style={{width:'100%',height:'100%'}}><div style={{width:'100rem'}}>
        <form>
            <FlexH x='space-between' style={{width:'32rem'}}>
                <div><SwitchItem check={depositMethod=='manual'} label='manual' v='manual' identity='manual' handleChange={changeDepositMethod}/></div>
                <div><SwitchItem check={depositMethod=='auto'} label='auto' v='auto' identity='auto' handleChange={changeDepositMethod}/></div>
            </FlexH>
        </form><GapV x='4'/>
        <form onSubmit={onSave}>
            <table>
                <thead><tr>{fields.map((f,i)=> <th key={i} style={{marginRight:'1rem'}}>{f}</th>)}</tr></thead>
                {/*{userTypes.map(({accountPrice},i)=> <tr key={i}>
                    {MBanks.map(({b,r},i)=> <td key={i}><NumberField type="number" name={b} value={r} />{}</td>)}
                    <td><NumberField type="number" name="" value={accountPrice} /></td>
                </tr>)} */}<tbody>
                {formData?.map(({level,topup,drive,mbank,regFee,permission},i)=> <tr key={i} style={{color:textPrimary,lineHeight:'3rem'}}>
                    <td>{level}</td>
                    <td><Field   x='4' type='number' value={formData[i].topup.commission.bkash} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,topup:{...formData[i].topup,commission:{...formData[i].topup.commission,bkash:Number(e.target.value)}}}:l))} /></td>
                    <td><Field   x='4' type='number' value={formData[i].topup.commission.dbbl} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,topup:{...formData[i].topup,commission:{...formData[i].topup.commission,dbbl:Number(e.target.value)}}}:l))} /></td>
                    <td><Field   x='4' type='number' value={formData[i].topup.commission.nagad} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,topup:{...formData[i].topup,commission:{...formData[i].topup.commission,nagad:Number(e.target.value)}}}:l))} /></td>
                    <td><Field   x='4' type='number' value={formData[i].drive.commission.bkash} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,drive:{...formData[i].drive,commission:{...formData[i].drive.commission,bkash:Number(e.target.value)}}}:l))} /></td>
                    <td><Field   x='4' type='number' value={formData[i].drive.commission.dbbl} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,drive:{...formData[i].drive,commission:{...formData[i].drive.commission,dbbl:Number(e.target.value)}}}:l))} /></td>
                    <td><Field   x='4' type='number' value={formData[i].drive.commission.nagad} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,drive:{...formData[i].drive,commission:{...formData[i].drive.commission,nagad:Number(e.target.value)}}}:l))} /></td>
                    <td><Field   x='4' type='number' value={formData[i].mbank.commission.bkash} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,mbank:{...formData[i].mbank,commission:{...formData[i].mbank.commission,bkash:Number(e.target.value)}}}:l))} /></td>
                    <td><Field   x='4' type='number' value={formData[i].mbank.commission.dbbl} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,mbank:{...formData[i].mbank,commission:{...formData[i].mbank.commission,dbbl:Number(e.target.value)}}}:l))} /></td>
                    <td><Field   x='4' type='number' value={formData[i].mbank.commission.nagad} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,mbank:{...formData[i].mbank,commission:{...formData[i].mbank.commission,nagad:Number(e.target.value)}}}:l))} /></td>
                    <td>
                        <Field   x='4' type='text' value={formData[i].topup.min} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,topup:{...formData[i].topup,min:e.target.value}}:l))} />
                        <Field   x='4' type='text' value={formData[i].topup.max} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,topup:{...formData[i].topup,max:e.target.value}}:l))}/>
                    </td>
                    <td>
                        <Field   x='4' type='text' value={formData[i].drive.min} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,drive:{...formData[i].drive,min:e.target.value}}:l))} />
                        <Field   x='4' type='text' value={formData[i].drive.max} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,drive:{...formData[i].drive,max:e.target.value}}:l))}/>
                    </td>
                    <td>
                        <Field   x='4' type='text' value={formData[i].mbank.min} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,mbank:{...formData[i].mbank,min:e.target.value}}:l))} />
                        <Field   x='4' type='text' value={formData[i].mbank.max} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,mbank:{...formData[i].mbank,max:e.target.value}}:l))}/>
                    </td>
                    <td><Field   x='4' type='text' value={formData[i].regFee} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,regFee:e.target.value}:l))}/></td>
                    {/*<td><input type='checkbox' checked={permission} /></td>*/}
                    <td><SwitchItem  check={formData[i].selfReg} handleChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,selfReg:e.target.checked}:l))} /></td>
                    <td><SwitchItem  check={formData[i].otp} handleChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,otp:e.target.checked}:l))} /></td>
                </tr>)}
            </tbody></table>
            <FlexH x='flex-end' y='center' /*style={{position:'sticky',bottom:'2rem',right:'2rem'}}*/><ThemeButton  type='submit' disabled={loading}>{loading?<Spinner />:'SAVE'}</ThemeButton></FlexH>
        </form>
    </div></ScrollViewH>
}

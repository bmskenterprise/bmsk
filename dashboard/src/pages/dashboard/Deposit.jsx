import {useEffect,useState} from 'react';
import {toast} from 'react-toastify';
import {useTheme} from '../../contexts/ThemeContext';
import {ScrollViewH,FlexH,GapV,NumberField,ThemeButton,Table,TR,TH,TD,Spinner} from '../../components/styles/Admin.style';
import url from '../../config/url';
import SwitchItem from '../../components/Switch'
import AdminPIN from '../../components/AdminPIN';
const fields = ['Level','Bkash(topup)','DBBL(topup)','Nagad(topup)','Upay(topup)','Bank(topup)','Bkash(drive)','DBBL(drive)','Nagad(drive)','Upay(drive)','Bank(drive)','Bkash(mbank)','DBBL(mbank)','Nagad(mbank)','Upay(mbank)','Bank(mbank)','Topup(min/max)','Drive(min/max)','MBank(min/max)','Reg. Fee','Self Reg','OTP']

export default  () =>{
    const {thememode,themeData:{themeBackground},modeData:{textPrimary}} = useTheme();
    const [formData,setFormData] = useState([]);
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
        }catch(e) {toast.error(e.message)}
    }
    
    const onSave = (e) => {
        e.preventDefault()
        AdminPIN([thememode,themeBackground],{cb:save,data:formData},'SAVE');
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
            toast.success(data.message||'saved');
        }catch(e) {toast.error(e.message)}
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
    
    return <div style={{width:'100%',height:'100%'}}>{/*<div style={{width:'100rem'}}>*/}
        <form>
            <FlexH x='space-between' style={{width:'100%',maxWidth:'32rem'}}>
                <div><SwitchItem check={depositMethod=='manual'} label='manual' v='manual' identity='manual' handleChange={changeDepositMethod}/></div>
                <div><SwitchItem check={depositMethod=='auto'} label='auto' v='auto' identity='auto' handleChange={changeDepositMethod}/></div>
            </FlexH>
        </form><GapV x='5'/>
        <form onSubmit={onSave} >
            <ScrollViewH style={{width:'100%'}}>
                <Table>
                    <thead><TR>{['level',...Object.keys(formData[0]?.fee??{})]?.map((f,i)=> <TH key={i} style={{marginRight:'1rem'}}>{f}</TH>)}</TR></thead>
                    <tbody>{formData.map(({level,fee},ind)=> <TR key={ind}>
                        <TD>{level}</TD>
                        {Object.keys(fee).map((mb,i)=> <TD key={i}><NumberField x='4' onChange={e=>setFormData(prev=>prev.map((l,index)=> ind==index?({...l,fee:{...prev[index].fee,[mb]:e.target.value}}):l))} style={{padding:'0.5rem',border:'0',outline:'0'}} value={fee[mb]}/>{}</TD>)}
                    </TR>)} 
                    </tbody>
                </Table>
            </ScrollViewH><GapV x='2'/>
            <FlexH x='flex-end'><ThemeButton type='submit' disabled={loading}>{loading?<Spinner/>:'SAVE'}</ThemeButton></FlexH>
        </form><GapV x='5'/>
        <form onSubmit={onSave}>
            <ScrollViewH style={{width:'100%'}}>
            <Table>
                <thead><TR>{fields.map((f,i)=> <TH key={i} style={{marginRight:'1rem'}}>{f}</TH>)}</TR></thead>
                {/*{userTypes.map(({accountPrice},i)=> <tr key={i}>
                    {MBanks.map(({b,r},i)=> <td key={i}><NumberField type="number" name={b} value={r} />{}</td>)}
                    <td><NumberField type="number" name="" value={accountPrice} /></td>
                </tr>)} */}<tbody>
                {formData?.map(({level,topup,drive,mbank,regFee,permission},i)=> <TR key={i} style={{color:textPrimary,lineHeight:'3rem'}}>
                    <TD>{level}</TD>
                    <TD><NumberField   /*x='4'*/ type='number' value={formData[i].topup.commission.bkash} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,topup:{...formData[i].topup,commission:{...formData[i].topup.commission,bkash:Number(e.target.value)}}}:l))} /></TD>
                    <TD><NumberField   /*x='4'*/ type='number' value={formData[i].topup.commission.dbbl} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,topup:{...formData[i].topup,commission:{...formData[i].topup.commission,dbbl:Number(e.target.value)}}}:l))} /></TD>
                    <TD><NumberField type='number' value={formData[i].topup.commission.nagad} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,topup:{...formData[i].topup,commission:{...formData[i].topup.commission,nagad:Number(e.target.value)}}}:l))} /></TD>
                    <TD><NumberField value={formData[i].topup.commission.upay} onChange={e=>setFormData(prev=> prev.map((l,ind)=> i==ind?({...l,topup:{...prev[i].topup,commission:{...prev[i].topup.commission,upay:e.target.value}}}):l))}/></TD>
                    <TD><NumberField value={formData[i].topup.commission.bank} onChange={e=>setFormData(prev=> prev.map((l,ind)=> i==ind?({...l,topup:{...prev[i].topup,commission:{...prev[i].topup.commission,bank:e.target.value}}}):l))}/></TD>
                    <TD><NumberField   /*x='4'*/ type='number' value={formData[i].drive.commission.bkash} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,drive:{...formData[i].drive,commission:{...formData[i].drive.commission,bkash:Number(e.target.value)}}}:l))} /></TD>
                    <TD><NumberField   /*x='4'*/ type='number' value={formData[i].drive.commission.dbbl} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,drive:{...formData[i].drive,commission:{...formData[i].drive.commission,dbbl:Number(e.target.value)}}}:l))} /></TD>
                    <TD><NumberField type='number' value={formData[i].drive.commission.nagad} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,drive:{...formData[i].drive,commission:{...formData[i].drive.commission,nagad:Number(e.target.value)}}}:l))} /></TD>
                    <TD><NumberField value={formData[i].drive.commission.upay} onChange={e=>setFormData(prev=> prev.map((l,ind)=> i==ind?({...l,drive:{...prev[i].drive,commission:{...prev[i].drive.commission,upay:e.target.value}}}):l))}/></TD>
                    <TD><NumberField value={formData[i].drive.commission.bank} onChange={e=>setFormData(prev=> prev.map((l,ind)=> i==ind?({...l,drive:{...prev[i].drive,commission:{...prev[i].drive.commission,bank:e.target.value}}}):l))}/></TD>
                    <TD><NumberField   /*x='4'*/ type='number' value={formData[i].mbank.commission.bkash} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,mbank:{...formData[i].mbank,commission:{...formData[i].mbank.commission,bkash:Number(e.target.value)}}}:l))} /></TD>
                    <TD><NumberField   /*x='4'*/ type='number' value={formData[i].mbank.commission.dbbl} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,mbank:{...formData[i].mbank,commission:{...formData[i].mbank.commission,dbbl:Number(e.target.value)}}}:l))} /></TD>
                    <TD><NumberField type='number' value={formData[i].mbank.commission.nagad} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,mbank:{...formData[i].mbank,commission:{...formData[i].mbank.commission,nagad:Number(e.target.value)}}}:l))} /></TD>
                    <TD><NumberField value={formData[i].mbank.commission.upay} onChange={e=>setFormData(prev=> prev.map((l,ind)=> i==ind?({...l,mbank:{...prev[i].mbank,commission:{...prev[i].mbank.commission,upay:e.target.value}}}):l))}/></TD>
                    <TD><NumberField value={formData[i].mbank.commission.bank} onChange={e=>setFormData(prev=> prev.map((l,ind)=> i==ind?({...l,mbank:{...prev[i].mbank,commission:{...prev[i].mbank.commission,bank:e.target.value}}}):l))}/></TD>
                    <TD>
                        <NumberField   x='4' type='text' value={formData[i].topup.min} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,topup:{...formData[i].topup,min:e.target.value}}:l))} />
                        <NumberField   x='4' type='text' value={formData[i].topup.max} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,topup:{...formData[i].topup,max:e.target.value}}:l))}/>
                    </TD>
                    <TD>
                        <NumberField   x='4' type='text' value={formData[i].drive.min} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,drive:{...formData[i].drive,min:e.target.value}}:l))} />
                        <NumberField   x='4' type='text' value={formData[i].drive.max} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,drive:{...formData[i].drive,max:e.target.value}}:l))}/>
                    </TD>
                    <TD>
                        <NumberField   x='4' type='text' value={formData[i].mbank.min} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,mbank:{...formData[i].mbank,min:e.target.value}}:l))} />
                        <NumberField   x='4' type='text' value={formData[i].mbank.max} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,mbank:{...formData[i].mbank,max:e.target.value}}:l))}/>
                    </TD>
                    <TD><NumberField   x='4' type='text' value={formData[i].regFee} onChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,regFee:e.target.value}:l))}/></TD>
                    {/*<td><input type='checkbox' checked={permission} /></td>*/}
                    <TD><SwitchItem  check={formData[i].selfReg} handleChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,selfReg:e.target.checked}:l))} /></TD>
                    <TD><SwitchItem  check={formData[i].otp} handleChange={e=>setFormData(formData.map((l,ind)=> i==ind?{...l,otp:e.target.checked}:l))} /></TD>
                </TR>)}
            </tbody></Table>
            </ScrollViewH>
            <GapV x='2'/><FlexH x='flex-end' y='center' /*style={{position:'sticky',bottom:'2rem',right:'2rem'}}*/><ThemeButton type='submit' disabled={loading}>{loading?<Spinner />:'SAVE'}</ThemeButton></FlexH>
        </form><GapV x='6'/>
        {/*</div>*/}</div>
}

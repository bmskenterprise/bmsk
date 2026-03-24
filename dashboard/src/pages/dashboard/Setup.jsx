import React,{ useEffect,useRef, useState } from 'react';
import {Container,Row,Accordion,} from 'react-bootstrap';
import {useMediaQuery} from 'react-responsive';
//import { FaPen,FaTrash } from 'react-icons/fa';
//import { toast } from 'react-toastify';
//BsPlusLg  } from 'react-icons/bs';
//import url from '../../config/url';// from "";
import {ScrollViewV,Loader,Spinner} from '../../components/styles/Admin.style';
import {useAdminAuth} from '../../contexts/AdminAuthContext'
import {useTheme} from "../../contexts/ThemeContext";
import ImageSlider from '../../components/setting/ImageSlider';
import TelecomAccess from '../../components/setting/TelecomAccess';
import Bank from '../../components/setting/Banks';
import MBanks from '../../components/setting/MBanks';
import Contact from '../../components/setting/Contact';
import SocialMedia from '../../components/setting/SocialMedia'
import Telecom from '../../components/setting/Telecoms'
import Routing from '../../components/setting/Routing';
import PaymentGateways from '../../components/setting/PaymentGateways';
import Services from '../../components/setting/Services';


export default  () =>{
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const {themeData, modeData:{backPrimary,backSecondary,textPrimary}} = useTheme();
        /*const permission = config['permission'];*/let [imagesRef,linkRef]=[useRef(null),useRef(null)];
        const {appData/*:{topupAccess,driveAccess,regularAccess,mbanks,slideImages,routing,contacts,bankNames,pgws}*/} = useAdminAuth();
        const [links,setLinks] = useState();
        const [linkText,setLinkText] = useState('');
        const [loading,setLoading] = useState(false);
        /*useEffect(() =>{


        },[]);*/

        /*const addImageLink = e=>{
            let linkText = linkRef.current.value;
            if(linkText.trim()==='')return;
            if(links.includes(linkText))return toast.error('link already exists');
            fetch(sliderImagesURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({link:linkText,active:true})
            })
            .then(res => res.json())
            .then(data => setLinks(data))
        };
        const editImageLink = e=>{
           fetch(sliderImagesURL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({link:linkText})
           })
           .then(res => res.json())
           .then(data => setLinks(data))
           .catch(err => toast.error('failed to update image link'))
           .finally(()=>setEditMode(false))
        }
        //;
        const deleteImage = linkText=>{
            fetch(sliderImagesURL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({link:linkText})
            })
            .then(res => res.json())
            .then(data => setLinks(data))
        };*/

        return <ScrollViewV style={{width:'100%',height:'100%',position:'relative'}}><div style={{background: backPrimary}}>
            {/*Object.keys(permission).map((p) => {
                permission[p].map((t,i)=> <div key={i}><input type='radio' name={key.split(' ')[0]} id={t} /><label htmlFor={t}>{t}</label></div>)
            })
            */}
        {isMobile?<Accordion>
            {/*<Notice notices={admin.notices}/>
            <Deposit topupBalance={admin.topupBalance} bankBalance={admin.bankBalance} />*/}
            <TelecomAccess /*accesses={{topupAccess:appData?.topupAccess,driveAccess:appData?.driveAccess,regularAccess:appData?.regularAccess}}*/ /*accessRegularPack={admin.regularHit}*/ />
            <MBanks /*mbanks={appData?.mbanks}*/ />
            <ImageSlider /*slideImages={appData?.slideImages}*/ />
            <Contact /*contacts={appData?.contacts}*//>
            {/*<SocialMedia socialLinks={appData?.socialLinks}/>*/}
            <Routing /*routing={appData?.routing}*/ />
            <Telecom></Telecom>
            <Bank /*bankNames={appData?.bankNames}*//>
            <PaymentGateways /*pgws={appData?.pgws}*//>
            <Services />
        </Accordion>
        :<Container fluid><Row>
            {/*<Notice notices={admin.notices}/>
            <Deposit topupBalance={admin.topupBalance} bankBalance={admin.bankBalance} />*/}
            <TelecomAccess /*accesses={{topupAccess:appData?.topupAccess,driveAccess:appData?.driveAccess,regularAccess:appData?.regularAccess}}*/ /*accessRegularPack={admin.regularHit}*/ />
            <MBanks /*mbanks={appData?.mbanks}*/ />
            <ImageSlider /*slideImages={appData?.slideImages}*/ />
            <Contact /*contacts={appData?.contacts}*//>
            {/*<SocialMedia socialLinks={appData?.socialLinks}/>*/}
            <Routing /*routing={appData?.routing}*/ />
            <Telecom></Telecom>
            <Bank /*bankNames={appData?.bankNames}*//>
            <PaymentGateways /*pgws={appData?.pgws}*//>
            <Services />
        </Row></Container>}
        </div>
        {loading&&<Loader><Spinner/></Loader>}  
        </ScrollViewV>
}

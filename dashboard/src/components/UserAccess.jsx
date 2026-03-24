import {FlexH} from '../components/styles/Admin.style'
import {serviceTypes,accessTypes} from '../../Preferences.json'
import SwitchItem from '../components/Switch'

export default  ({services,handleChange}) =>{
    return <div>
            {/*<Form>*/}
                {/*<h4>Reseller permission</h4>*/}
                {serviceTypes.map((service,i)=> <FlexH x='flex-start' key={i}>
                    <SwitchItem label={service} check={services.includes(service)} handleChange={e=>handleChange(e.target.value,)} identity={service} v={service}/> 
                </FlexH>)}
            {/*</Form>x*/}
            {/*<div>
                <h4>Reseller Access Options</h4>
                {accessTypes.map((access,i)=> <div key={i}>
                    <input type="checkbox" checked={accesses.includes(access)} name="access" id={access} /><label htmlFor={access}>{access}</label>
                </div>)}
            </div>*/}
        </div>
}

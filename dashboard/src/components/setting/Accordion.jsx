import {useState} from 'react'
import {BsChevronDown} from 'react-icons/bs'
import {AccordionItem,Rotate} from '../styles/Admin.style'

export default ({title,content}) =>{
  const [isOpen,setIsOpen] = useState(false)
  
  return <AccordionItem>
              <button onClick={e=>setIsOpen(prev=>!prev)}>{title}<Rotate collapse={isOpen}><BsChevronDown/></Rotate></button>
              {isOpen&&<div>{content}</div>}
  </AccordionItem>
}

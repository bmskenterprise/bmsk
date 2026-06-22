import styled,{keyframes,createGlobalStyle} from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --accordion-transition: all 0.3s ease;
  }
`;

export const ResponsiveLayout = styled.div`
  position: relative;width:100%;
  @media (min-width: 768px){
    position: static;
    display: flex;
    flex-flow: row nowrap;
  }
`

export const Stack = styled.div`
  background: ${({theme})=> theme?.modeData?.backSecondary};
  position: relative;/*top: 0;left: 0;*/
  /*& div{
    background:rgba(0,0,0,0.8);position:absolute;top:0;left:0;z-index:2; width:100%; height:100%;
  }*/
`;
export const CenterCard = styled.div`
  @media (min-width:768px){
    width: 30rem;
  }
  background: ${({theme})=> theme?.modeData?.backSecondary};
  border-radius:0.5rem;
  box-shadow: ${({theme})=> theme?.modeData?.glassmorph?.shadow};
  width: 80%;
  min-height: 20rem;
  //height: 100%;
  padding: 2rem;
  position:absolute;
  top:50%;
  left:50%; 
  transform:translate(-50%,-50%);
`;

export const Card = styled.div`
  background: ${({theme})=> theme?.modeData?.backSecondary};
  border-radius:0.5rem;
  box-shadow: ${({theme})=> theme?.modeData?.glassmorph?.shadow};
  width:100%;
  @media (min-width:768px){width: 30%;}
`


export const GapV = styled.div`
  height: ${({x})=>x}rem;
`
export const GapH = styled.div`
  width: ${({x})=>x}rem;display: inline-block;
`
export const Header = styled.header`
  background: ${({theme})=> theme?.themeData?.themeBackground};
  display: flex;
  flex-flow:row nowrap;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
  position: sticky;top:0;left:0;z-index:9;
`;
export const Avatar = styled.img`
  cursor:pointer;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
`;
export const ProfileCard = styled.div`
  background:${({theme})=>theme?.modeData?.backSecondary};
  box-shadow:${({theme})=> theme?.modeData?.glassmorph.shadow};
  color: ${({theme})=>theme?.modeData?.textPrimary};
  padding:1rem;position:absolute;
  top:100%; right:0; width:24rem; /*aspect-ratio:1;*/  z-index:8;
`;
export const ScrollViewH = styled.div`
  /*background:  rgba(0,0,0,0.3);
  flex-direction: row;*/
  overflow-x: auto;
  overflow-y: auto;
  /*height: 40vh;
  width: 60rem;*/
  &::-webkit-scrollbar {
    display: none;
  }
`
export const ScrollViewV = styled.div`
  overflow-y: auto;
  overflow-x: auto;
  /*&::-webkit-scrollbar {
    display: none;
  }*/
`

export const Col = styled.div`
  width: 100%;
  @media (min-width:768px){
    width: 32%;
  }
`

export const FlexH = styled.div`
  display: flex;
  flex-flow:row wrap;
  justify-content: ${({x})=>x};
  align-items: ${({y})=>y};
  //gap: 1rem;
`;

export const FlexV = styled.div`
  display: flex;
  flex-flow:column nowrap;
  justify-content: ${({y})=>y};
  align-items: ${({x})=>x};
  //gap: 1rem;
`;
export const SidebarContainer = styled.div`
  background: ${({theme})=> theme?.themeData?.themeBackground};
  height: 100vh;width:100%;position:absolute;z-index:6;
  @media (min-width:768px){
    width: 15%;position: static;
  }
  & li{
    width: 100%;
    color: ${({theme})=> theme?.themeData?.themeText};
  }
`;
export const PageContent = styled.div`
  width:${({sidebartoggler})=>sidebartoggler?'85%':'100%'};height:100%;
  //display:flex;flex-flow:column nowrap
`

export const ThemeButton = styled.button`
  background:${({theme})=> theme?.themeData?.themeBackground};
  border:0;
  border-radius: 0.25rem;
  color:${({theme})=> theme?.themeData?.themeText};
  cursor: pointer;
  padding: 0.25rem 0.5rem;
`;
export const PrimaryButton = styled.button`
  border: none;
  background: ${({theme})=> theme?.modeData?.backPrimary};
  border-radius: 0.25rem;
  color: ${({theme})=>theme?.modeData?.textPrimary};
  cursor: pointer;
  padding:0.5rem;
`
export const SecondaryButton = styled.button`
  border: none;
  background: ${({theme})=> theme?.modeData?.backSecondary};
  border-radius: 0.25rem;
  color: ${({theme})=>theme?.modeData?.textPrimary};
  cursor: pointer;
  padding:0.5rem;
`
  //display: ${({sidebarToggler})=> sidebarToggler?'block':'none'};

export const Field = styled.input`
  background: transparent;
  border: 1px solid ${({theme})=>theme?.modeData?.textSecondary};
  color: ${({theme})=>theme?.modeData?.textPrimary};
  outline: none;font-size: 1.3rem;
  &:focus{border:1px solid ${({theme})=>theme?.themeData?.themeBackground};}
  width: ${({x})=>x}rem;
`;
export const NumberField = styled.input`
  background: transparent;
  border: 0;
  padding: 0.5rem;
  color: ${({theme})=>theme?.modeData?.textPrimary};
  outline: none;font-size: 1.3rem;
  width: ${({x})=>x?`${x}rem`:'100%'};
  &:focus{border:1px solid ${({theme})=>theme?.themeData?.themeBackground};}
`;

export const InputField= styled.input`
  background:transparent;
  border: 1px solid ${({theme})=>theme?.modeData?.textPrimary};
  color: ${({theme})=>theme?.modeData?.textPrimary};
  outline: none;
  padding: 0.5rem;
  &:focus{border:1px solid ${({theme})=>theme?.themeData?.themeBackground};}
  width: 100%;
`
export const Select = styled.select`
  background: transparent;font-size: 1.2rem;
  padding:0.5rem;
  & >option{
    background: ${({theme})=>theme?.modeData?.backSecondary};
    color: ${({theme})=>theme?.modeData?.textPrimary};
  }
`
export const DatePicker = styled.input`
  background: transparent;
  border: 1px solid ${({theme})=>theme?.modeData?.textPrimary};
  color: ${({theme})=>theme?.modeData?.textPrimary};
  font-size: 1.3rem;
  outline: none;
  &:focus{border:1px solid ${({theme})=>theme?.themeData?.themeBackground};}
  &::-webkit-calendar-picker-indicator {
    filter: invert(1);opacity: 0.8;
  }
`
export const Switch = styled.div`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
  cursor: pointer;
  /*@media (min-width:768px){
    height: 27px
  }*/
  & input{
    opacity: 0;
    width: 0;
    height: 0;
    &:checked + div {
      background-color: ${({theme})=>theme.themeData?.themeBackground};
    }
    &:checked + div::before {
      -webkit-transform: translateX(22px);
      -ms-transform: translateX(22px);
      transform: translateX(22px);
      /*@media (min-width:768px){
        -webkit-transform: translateX(21px);
        -ms-transform: translateX(21px);
        transform: translateX(21px);
      }*/
    }
  }
  & div{
    border-radius: 22px;
    /*@media (min-width:768px){
      border-radius: 27px;
    }*/
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.2s;
    transition: 0.2s;
    &::before{
      /*@media (min-width:768px){
        height: 21px;
        width: 21px;
        left: 3px;
      }*/
      background-color: white;
      border-radius: 50%;
      bottom: 2px;
      content: '';
      position: absolute;
      height: 18px;
      width: 18px;
      left: 2px;
      -webkit-transition: 0.2s;
      transition: 0.2s;
    }
  }
`

export const ErrorText = styled.span`color:red;`

export const ThemeRadio=styled.input`
  accent-color:${({theme})=>theme?.themeData?.themeBackground};
  aspect-ratio: 1;
  width: 1.5rem;
`
export const TA = styled.textarea`
  background: transparent;
  border: 1px solid ${({theme})=>theme?.modeData?.textPrimary};
  color: ${({theme})=>theme?.modeData?.textPrimary};
  outline: none;
  &:focus{border:1px solid ${({theme})=>theme?.themeData?.themeBackground};}
`


export const Rotate = styled.span`
  margin-left: auto;
  transform: rotate(${({collapse})=>collapse?'180deg':'0deg'});
  transition: transform 0.2s linear;
`;
export const InlineBadge = styled.span`
  background: red;
  color: white;
  font-size: 0.5rem;
  padding: 0.25rem 0.5rem;
`;
export const Badge = styled(InlineBadge)`
  border-radius: 50%;
  position: absolute;right: -0.4rem;top: -0.4rem;
`;
export const Tooltip = styled.span`
  background: black;
  color: white;
  padding: 0.5rem;
  position: absolute;
  top: 0;
  right: 100%;
`;



export const TinyIcon = styled.img`
  width: 1.5rem;
  height: 1.5rem;
`;
export const Icon = styled.img`
  width: ${({x})=>x}rem;
  height: ${({x})=>x}rem;
`;
export const IconButton = styled.button`
  background: none;
  border: none;
  color:${({theme})=>theme?.modeData?.textPrimary};
  cursor: pointer;font-size:${({size})=>size?`${size}rem`:'1.2rem'};
`;
export const MenuTogglerButton = styled.button`
  background: none;
  border: none;
  color:white;
  cursor: pointer;font-size:${({size})=>size?`${size}rem`:'1.2rem'};
`;

export const ApproveButton = styled.button`
  background: green;
  border: none;
  border-radius: 4px;
  color: white;cursor:pointer;
  padding: 0.5rem 0.8rem;outline: none;
`
export const RejectButton = styled.button`
  background: tomato;
  border: none;
  border-radius: 4px;
  color: white;cursor:pointer;
  padding: 0.5rem 0.8rem;outline: none;
`

export const ThemeUnit = styled.div`
  border: 1px solid ${({theme,color})=> theme?.themeData?.themeBackground==color?color:'transparent'};
  border-radius: 50%;
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  position: relative;
  &::after{
    width: 80%;
    height: 80%;
    content: '';
    background: ${(props) => (props.color)};
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    z-index: 1;
  }
`;
export const TelecomOverlay = styled.div`
  background: rgba(0,0,0,0.3);
  display: none;
  place-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
`
export const TelecomCard = styled.div`
  position: relative;
  width: 5rem;
  height: 5rem;
  & h4{display:none}
  &:hover h4{display:block}
  &:hover ${TelecomOverlay}{
    display: grid;
  }
`
export const TelecomLogo = styled.img`
  aspect-ratio: 1;
  width: 100%;
`
export const AddButton = styled.div`
  border: 1px solid black;
  cursor: pointer;
  display: grid;
  place-items: center;
  width: 5rem;
  height: 5rem;
`

export const DropdownHeader = styled.div`
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;height: 1rem;
  padding: 12px 15px;
  transition: all 0.3s ease;
  & img{
    width: 1rem;
    height: 1rem;
    margin-right: 8px;
  }
`
export const DropdownItems = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 0;
  overflow: hidden;
    background-color: white;
    border: 1px solid transparent;
    border-radius: 0 0 6px 6px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: max-height 0.3s ease, border-color 0.3s ease;
    z-index: 10;
`
export const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
`
export const DropdownArrow = styled.img`
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #666;
  transition: transform 0.3s ease;
`


export const Table = styled.table`
  border-collapse:collapse;
`
export const TH = styled.th`
  font-size: 1.1rem;border: 1px solid ${({theme})=>theme?.modeData?.textPrimary};//font-size: ;
  @media (min-width:768px){font-size: 1.3rem;}
`
export const TR = styled.tr`
  @media (min-width:768px){
    font-size: 1.3rem;
  }
  font-size: 0.8rem;
  padding-block: 0.8rem;
  margin-block: 1rem;
  &:nth-child(even){
    background:'transparent';
    color:${({theme})=>theme?.modeData?.textPrimary};
  }
  &:nth-child(odd){
    background:${({theme})=>theme?.modeData?.backSecondary};
    color:${({theme})=>theme?.modeData?.textSecondary};
  }
`
export const TD = styled.td`
  border: 1px solid ${({theme})=>theme?.modeData?.textPrimary};
  font-size: 1.1rem;
  @media (min-width:768px){font-size: 1.3rem;}
`

export const StripedList = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  padding:0.5rem 0;
  &:nth-child(even){
    background: ${({theme})=>theme?.modeData?.backSecondary};
    color:${({theme})=>theme?.modeData?.textSecondary};
  }
  &:nth-child(odd){
    background: ${({theme})=>theme?.modeData?.backPrimary};
    color:${({theme})=>theme?.modeData?.textPrimary};
  }
`

export const ThemeRow = styled.div`
  background:${({mark,scheme})=>mark.selected.includes(mark.id)?scheme.theme.themeBackground:'transparent'};
  color:${({mark,scheme})=>mark.selected.includes(mark.id)?scheme.theme.themeText:scheme.mode.textPrimary};
  display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center;
`

export const Pagination = styled.ul`
  display: flex;
  flex-flow: row nowrap;
  padding: 0;
  list-style-type: none;
  & button{
    background: none;
    color: ${({theme})=>theme?.modeData?.textPrimary};
    border: 1px solid ${({theme})=>theme?.modeData?.textPrimary};
    cursor: pointer;
    width: 2.5rem;
    height: 2.5rem;
  }
`
export const PaginationBar = styled.div`
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const Loader = styled.div`
  background:${({theme})=>theme?.modeData?.backPrimary};opacity:0.8;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
`;
 const spinner = keyframes`
  from{transform: rotate(0deg);}
  to{transform: rotate(360deg);}
`
export const Spinner = styled.div`
  animation: ${spinner} 1s linear infinite;
  border: 3px solid ${({theme})=> theme?.themeData?.themeBackground};
  border-top: 3px solid transparent;
  border-radius: 50%;
  width: ${({size})=> size?size:3}rem;
  height: ${({size})=> size?size:3}rem;
`;
export const AccordionItem = styled.div`
  & >button{
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 1.25rem 0.5rem;
    font-size: 1.5rem;
    color: ${({theme})=>theme?.modeData?.textSecondary};
    text-align: left;
    background: ${({theme})=>theme?.modeData?.backSecondary};
    border: 0;
    border-radius: 0;
    overflow-anchor: none;
    transition: var(--accordion-transition);
    -webkit-transition: var(--accordion-transition);
    -moz-transition: var(--accordion-transition);
    -ms-transition: var(--accordion-transition);
    -o-transition: var(--accordion-transition);
    &:focus{
      outline: 0;
    }
    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
  }
`;
export const Center = styled.div`
  width: 100%;
  height: 100%;display: grid;place-items: center;
`;
//export {Loader,Header,Avatar,FlexH,FlexV,Col,Rotate,TinyNumberField,TinyIcon,Stack,Tooltip,IconButton,InlineBadge,ScrollViewH,AddButton,DropdownItems,DropdownItem,DropdownArrow};

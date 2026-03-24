export const launchDate = '2026-03-20'
export const getAheadLocalDate = days=>{
    const d = new Date();
    d.setDate(d.getDate()+days);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export const getAheadLocalDateTime = days=>{
    const d = new Date();
    d.setDate(d.getDate()+days);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${d.getHours()}:${d.getMinutes()}`;
}

export const getCurrentLocalDateTime = e=>{
    const now = new Date();
    return new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,16)
}

export const getCurrentLocalDate = e=>{
    const now = new Date();
    return new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,10)
}


export const getLocalDateTimeFromUTC = utcString=>{
    const utcDate = new Date(utcString);
    const hours = utcDate.getHours();
    return `${utcDate.getFullYear()}/${String(utcDate.getMonth()+1).padStart(2,'0')}/${String(utcDate.getDate()).padStart(2,'0')}, ${String(hours>12?hours-12:hours).padStart(2,'0')}:${String(utcDate.getMinutes()).padStart(2,'0')} ${hours>=12?'PM':'AM'}`
}
export const renderLocalTimeFromUTC = utcString=>{
    const utcDate = new Date(utcString);
    return new Date(utcDate.getTime()-utcDate.getTimezoneOffset()*60000).toISOString().slice(0,16)
}
export const getLocalDateFromUTC = utcString=>{
    const d = new Date(utcString);
    return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)
}
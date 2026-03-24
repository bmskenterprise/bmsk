import {toast} from 'react-toastify'
export default async(textToCopy) =>{
  try {
    await navigator.clipboard.writeText(textToCopy);
    toast.success('copied to clipboard!');
  } catch (err) {
    toast.error('Failed to copy text: ', err);
  }
}
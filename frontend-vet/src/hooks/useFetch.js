import axios from 'axios';
import {toast} from 'react-toastify';


function useFetch(){
    const fetchDataBackend = (url,form=null,method='POST')=>{
        try{
            let respuesta
            if (method=='POST'){
                respuesta = axios.post(url,form)

            }else if(method=='GET'){
                respuesta = axios.get(url)
            }
            toast.success(respuesta?.data?.msg)
            return respuesta?.data

        }catch(error){
            toast.error(error.reponse?.data?.msg)
            const errorMsg = error.reponse?.data?.msg || 'Error con el servidor'
            throw new Error (errorMsg)
        }
    }
    return {fetchDataBackend}
}


export default useFetch
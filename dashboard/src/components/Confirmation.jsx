import Swal from 'sweetalert2'

             
             
             
              
export default (theme,deleteHandler,selected)=>{
    Swal.fire({
        title: 'want to delete?',
        confirmButtonColor: '#d33',
        confirmButtonText: 'DELETE',  
        theme: theme,    
        showCancelButton: true,
        cancelButtonText: 'CANCEL',
        }
    ).then((result) => {
            if (result.isConfirmed) {
                deleteHandler(selected)/*Swal.fire({
                    title: 'Deleted!',
                    icon: 'success',
                })*/
            }
    })
}
//.catch();
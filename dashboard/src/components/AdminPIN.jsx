import Swal from 'sweetalert2';

export default (thememode,callback,cbt) =>{
  Swal.fire({
    title: "Enter Super Admin PIN",
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
    showCancelButton: true,
    confirmButtonText: cbt,
    theme: thememode,
    preConfirm:  (pin) => {
      try {callback.cb(callback.data,pin)
        /*const githubUrl = `https://api.github.com/users/${login}`;
        const response = await fetch(githubUrl);
        if (!response.ok) {
          return Swal.showValidationMessage(`
            ${JSON.stringify(await response.json())}
          `);
        }
        return response.json();*/
      } catch (error) {
        Swal.showValidationMessage(`
          Request failed: ${error}
        `);
      }
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.isConfirmed) {
      /*Swal.fire({
        title: `${result.value.login}'s avatar`,
        imageUrl: result.value.avatar_url
      });*/
    }
  });
}
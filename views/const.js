
const ENV = false

function getServerUrl(){
    if(ENV){
        return 'http://127.0.0.1:8000'
    }else{
        return 'https://energia-backend-1tk8.onrender.com'
    }
}




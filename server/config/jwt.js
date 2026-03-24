import jwt from 'jsonwebtoken';

const createJWT = (payload,secretKey,expiresIn) => {
    try{
        return jwt.sign(payload,secretKey,{expiresIn})
            /*payload,
            secretKey,
            {expiresIn}
        )*/
    }catch (e){
        console.error('failed to sign the jwt', e);
        throw e;
    }
}

export default createJWT
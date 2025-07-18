const jwt=require("jsonwebtoken");
const jwtToken=(userId,res)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:'30d'
    })

    res.cookie('jwt',token,{
        maxAge:30*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict",
        secure:process.env.SECURE !=="devlopment"
    })

    return token;
}

module.exports={jwtToken};
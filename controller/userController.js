const User=require('../models/userModel');
const bcrypt=require('bcrypt');
const userOtpVerification = require('../models/userOTPModel')
const nodemailer=require('nodemailer');
const {joiRegistrationSchema} = require('../models/ValidationSchema');
const Boom = require('boom');


const securePassword =async(password)=>{
    try{
       const passwordHash = await bcrypt.hash(password,10);
       return passwordHash;
    }catch(error){
         console.log(error.message);
    }
}

const loadHome = async(req,res)=>{
    try {
        res.render('home');
    } catch (error) {
        console.log(error.message)
    }
}


const loadLogin=async(req,res)=>{
    try{
     res.render('login')
    }catch(error){
        console.log(error.message);

    }
}

const loadSignup=async(req,res)=>{
    try {
        res.render('signUp');
    } catch (error) {
        console.log(error.message)
    }
}

const insertUser =async(req,res)=>{
   
    try {
        const { error } = joiRegistrationSchema.validate(req.body, {
            abortEarly: false
          });
    if(error){ 
        console.log('Invalid registration');
    }
    // console.log(error.message,1111111111111111111111111111);
    // const errorsArray =  error.message.split('.')
    // console.log(errorsArray)
        const value = await joiRegistrationSchema.validateAsync(req.body)
        console.log(value)
        const {name,email,mobile,password,confirmPassword} = value;
            const emailCheck = await User.findOne({email});
            if(!emailCheck){
                    const spassword= await securePassword(password);
                    
                  const user = await User.create( {name:name,email:email,mobile:mobile,password:spassword})
                 
                sendOTPverificationEmail(user,res);
              }else{
               return res.render('signUp',{message:'Email is already exists'})
              }
    }catch (error) {
        console.log(error.message);
    }
}

const sendOTPverificationEmail=async({email},res)=>{
    try {

        let transporter=nodemailer.createTransport({
              service:'gmail',
              host:'smtp.gmail.com',
              port:465,
              secure:true,
              auth:{
                user:process.env.EMAIL,
                pass:'icor drdl gelp qutd'
              }
        });

        otp=`${Math.floor(1000+Math.random() * 9000)}`;

        const mailOptions = {
            from:process.env.EMAIL,
            to:'anamikap6840@gmail.com',
            subject:'Verify your email',
            html:`Your OTP is:${otp}`
        };

        const hashedOTP =await bcrypt.hash(otp,10);

        const newOtpVerification = await new userOtpVerification({email:email,otp:hashedOTP});
        await newOtpVerification.save();
        await transporter.sendMail(mailOptions);
        res.redirect(`/otp?email=${email}`);
        
    } catch (error) {
        console.log(error.message)
    }
}


const loadOtp =async(req,res)=>{
    try {
        const email =req.query.email;
        res.render('otpVerification',{email:email});
    } catch (error) {
        console.log(error.message);
    }
}

const verifyOtp =async(req,res)=>{
    try {
        const email =req.body.email;
        const otp = req.body.digit1 + req.body.digit2 + req.body.digit3 + req.body.digit4 ;
        const userVerification = await userOtpVerification.findOne({email:email});
        if(!userVerification){
            
            res.redirect('/otp',{message:"otp expired"})
            return;
        }
        const {otp:hashedOTP}=userVerification;
        const validOtp =await bcrypt.compare (otp,hashedOTP);
        if(validOtp){
            const userData=await User.findOne({email:email});
               
            if(userData){
                await User.findByIdAndUpdate({
                    _id:userData._id
                },{
                    $set:{is_varified:true}
                })
            }

            const user= await User.findOne({email:email})
            await userOtpVerification.deleteOne({email:email});
            if(user.is_varified){
                if(!user.is_blocked){
                    req.session.user={
                        _id:user._id,
                        email:user.email,
                        name:user.name
                    }
                    console.log("user",req.session.user);
                    res.redirect('/login')
                }else{
                    res.redirect('/login')
                }
            }else{
                res.redirect('/login')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resendOtp=async(req,res)=>{
    try {
        const userEmail= req.query.email
        await userOtpVerification.deleteMany({email:userEmail})
        if(userEmail){
            sendOTPverificationEmail({email:userEmail},res);
        }else{
        }
    } catch (error) {
        console.log(error.message)
    }
}


const verifyLogin = async(req,res)=>{
    try {
        const email=req.body.email;
        const password=req.body.password;
        const userData = await User.findOne({email:email})
        
        if(userData){
            if(userData.is_blocked===false){
            const passwordMatch= await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                req.session.user_id= userData._id;
                res.redirect('/');
            }else{
                res.render('login');

                console.log('password is incorrect')
            }
        }else{
            console.log('user is blocked')
        }
        }else{
            res.render('login');
            console.log('email is incorrect');
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadDashboard =   async(req,res)=>{
    try {
        res.render('profile')
    } catch (error) {
        console.log(error.message)
    }
}



const loadLogout = async(req,res)=>{
    try {

        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}

const loadContact = async(req,res)=>{
    try {
        res.render('contact')
    } catch (error) {
        console.log(error.message);
    }
}

const loadAbout = async(req,res)=>{
    try {
        res.render('about')
    } catch (error) {
        console.log(error.message);
    }
}

const loadProfile = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId)
        res.render('profile',{userData})

    } catch (error) {
        console.log(error.message);
    }
}


const editProfile = async(req,res)=>{
    try {
         const email = req.body.userEmail;
         const newUserName = req.body.updatedName;
         const newMobile = req.body.updatedMobile;
         const findUsernameExist = await User.find({name:newUserName});
         if(!findUsernameExist.length>0){
            const user = await User.findOneAndUpdate({
                email:email
            },{
                $set: {
                    name:newUserName,
                    mobile: newMobile,
                    
                }
            },{
                new:true
            })
         }
         
    } catch (error) {
        console.log(error.message);
    }
}

const resetPasswithOld = async(req,res)=>{
    try {
        const {confirmPass,userEmail,oldPass}= req.body;
        const user = await User.findOne({email:userEmail});

        const passwordMatch = await bcrypt.compare(oldPass,user.password);
        if(!passwordMatch){
            console.log("The password is incorrect");
        }else{
            const passwordSame = await bcrypt.compare(oldPass,confirmPass);
            if(passwordSame || confirmPass===oldPass){
                console.log('reset failed');
            }else{
                const securePass = await securePassword(confirmPass);
                await User.findOneAndUpdate({email:userEmail},{
                    $set:{
                        password:securePass
                    }
                })
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const addAddress = async(req,res)=>{
    try{
        const{
            name,
            country,
            streetName,
            landMark,
            town,
            state,
            pin,
            phone,
            email
        } = req.body;

        await User.findOneAndUpdate({
            email:email
        },{
            $push:{
                addresses:{
                    name:name,
                    streetAddress:streetName   ,
                    city:town,
                    state: state,
                    country:country,
                    pincode: pin,
                    mobile:phone,
                    email:email,
                    landMark:landMark
                }
            }
        })
    }catch(error){
        console.log(error.message);
    }
}

const editAddress = async(req,res)=>{
    try {
         const {name,country,streetName,LandMark,town,state,pin,phone,email} = req.body;
         console.log(email);
        const user = await User.findOneAndUpdate({
            email:email
         },{
            $set:{
                    "addresses.$.name": name,
                    "addresses.$.streetAddress": streetName,
                    "addresses.$.city": town,
                    "addresses.$.state": state,
                    "addresses.$.country": country,
                    "addresses.$.pincode": pin,
                    "addresses.$.mobile": phone,
                    "addresses.$.landMark": LandMark
                  
         }
        },{
            new:true
         })
         console.log(user);
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
    loadLogin,
    loadSignup,
    insertUser,
    verifyOtp,
    loadOtp,
    verifyLogin,
    loadHome,
    loadDashboard,
    loadLogout,
    resendOtp,
    loadContact,
    loadAbout,
    loadProfile,
    editProfile,
    resetPasswithOld,
    addAddress,
    editAddress
}
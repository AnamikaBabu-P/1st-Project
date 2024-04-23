const { joiCouponSchema } = require('../models/ValidationSchema');
const { off } = require('../models/categoryModel');
const Coupon = require('../models/couponModel');


const loadCouponList = async(req,res)=>{
    try {
        const couponData = await Coupon.find({})
        res.render('couponList',{couponData})
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddCoupon = async(req,res)=>{
    try {
        res.render('addCoupon')
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async(req,res)=>{
    try {
        const value = await joiCouponSchema.validateAsync(req.body)
        console.log('val',value);
        const {name,ValidityDate,offerPrice,maximumLimit,couponCode} = value;
        const data = new Coupon({
            name:name,
            expiryDate:ValidityDate,
            offerPrice:offerPrice,
            miniLimit:maximumLimit,
            couponCode:couponCode
        });
        await data.save()

        console.log('da',data);
        res.redirect('/admin/couponList')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteCoupon = async(req,res)=>{
    try {
        const {couponId} = req.query
        await Coupon.findByIdAndDelete({_id:couponId});
        res.redirect('/admin/couponList')
    } catch (error) {
        console.log(error.message);
    }
}

const loadEditCoupon = async(req,res)=>{
    try {
        const couponData = await Coupon.findById({_id:req.query.id});
        res.render('editCoupon',{couponData})
    } catch (error) {
        console.log(error.message);
    }
}

const editCoupon = async(req,res)=>{
    try {
        const {couponId} = req.query
        const couponData = await Coupon.findOneAndUpdate({_id:couponId},{$set:{name:req.body.name,expiryDate:req.body.ValidityDate,offerPrice:req.body.offerPrice,miniLimit:req.body.maximumLimit,couponCode:req.body.couponCode}})
        res.redirect('/admin/couponList')
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadCouponList,
    loadAddCoupon,
    addCoupon,
    deleteCoupon,
    loadEditCoupon,
    editCoupon
}
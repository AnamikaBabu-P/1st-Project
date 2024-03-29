
const category=require('../models/categoryModel')
const products= require('../models/productsModel')
const path = require('path');
const {joiProductSchema} = require('../models/ValidationSchema')



const loadProductList=async(req,res)=>{
   try {

    var page = 1;
    if(req.query.page){
        page = req.query.page;
    }
    const limit = 2;
    const productData = await products.find().populate({path:'categories',model:'categories'
     })
     .limit(limit * 1)
      .skip((page-1)* limit)
      .exec();
      
    const count = await products.find({
    }).countDocuments();


    res.render('productList',{products:productData,totalPages:Math.ceil(count/limit),currentPage:page})
   } catch (error) {
     console.log(error.message)
   }
    
}
const loadAddProducts = async(req,res)=>{
    try {
        const categoryData = await category.find({}) 
        res.render('addProducts',{categoryData});
    } catch (error) {
        console.log(error.message)
    }
}

const addProducts = async(req,res)=>{
    try {
       const value= await joiProductSchema.validateAsync(req.body)
       const {name,description,price,categories,image} = value
         await products.create(
             {name:name,
             description:description,
             price:price,
             categories:categories,
             image:image,
             is_listed:true,
             size:['s','xs']
             })
                 res.redirect('/admin/productList')
       
    } catch (error) {
        console.log(error.message)
    }
}

const listProduct=async (req,res)=>{
    try {
        const {productId}= req.query
        const data = await products.findOne({_id:productId});
        data.is_listed=!data.is_listed
        const d1 =  await data.save();
    } catch (error) {
        console.log(error.message)
    }
}

const editProductLoad = async(req,res)=>{
    try{
        const id=req.query.id;
        const productData=await products.findById({_id:id})
        const categoryData=await category.find()
        if(productData){
            res.render('editProducts',{categories:categoryData,products:productData})
        }else{
            res.redirect('/admin/productList');
        }
    }catch(error){
        console.log(error.message);
    }
}

const updateProducts = async (req,res)=>{
    try {
        const productData = await products.findOne({_id:req.body.id})
        if(productData){
         await products.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,description:req.body.description,categories:req.body.category,price:req.body.price,image:req.body.image}});
            res.redirect('/admin/productList')
        }else{
            res.render('editProducts',{products:productData,message:'Category already exists'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const productPage = async(req,res)=>{
   try {
    const productData = await products.find({is_listed:true})
    res.render('products.ejs',{products:productData});
   } catch (error) {
    console.log(error.message)
   }
}

const productDetails = async(req,res)=>{
    try {
        const {id} = req.query
        const productData = await products.findById({_id:id});
        res.render('productDetail',{products:productData})
    } catch (error) {
       console.log(error.message) 
    }
        
}

module.exports={
    loadProductList,
    loadAddProducts,
    addProducts,
    listProduct ,
    editProductLoad,
    updateProducts,
    productPage,
    productDetails
}
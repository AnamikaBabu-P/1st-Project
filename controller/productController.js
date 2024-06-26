
const category=require('../models/categoryModel');
const products= require('../models/productsModel');
const Cart = require('../models/cartModel');
const Wishlist = require('../models/wishlistModel');
const multer = require('multer')
const path = require('path');
const {joiProductSchema} = require('../models/ValidationSchema')
const uuid = require('uuid');
const cloudinary = require("../utils/cloudinary");
const Offer = require('../models/offerModel');
const Order = require('../models/orderModel')
const mongoose = require('mongoose')

const storage = multer.memoryStorage();
const upload = multer({storage:storage});


const loadProductList=async(req,res)=>{
   try {

    var page = 1;
    let productQuery;
    if(req.query.page){
        page = req.query.page;
    }
    const limit = 5;
    if (req.query.search && req.query.search.trim() !== '') {
        const searchPattern = new RegExp(req.query.search.trim(), 'i').source;
    
        productQuery = {
                 $or: [{ name: { $regex: searchPattern } }, { description: { $regex: searchPattern } }] ,
        };
    }
    const productData = await products.find(productQuery).populate({path:'categories',model:'categories'})
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
        
    const messages = req.flash('messages')[0] || {}; 
    const formData = req.flash('formData')[0] || {};
        res.render('addProducts',{categoryData,messages,formData});
    } catch (error) {
        console.log(error.message)
    }
}

// const addProducts = async(req,res)=>{
//     try {

//         const { error } = joiProductSchema.validate(req.body, {
//             abortEarly: false
//           });
//     if(error){ 
//         const errorMessages = error.details.reduce((acc, cur) => {
//             acc[cur.context.key] = cur.message;
//             return acc;
//         }, {});
//         req.flash('messages', errorMessages);
//         req.flash('formData', req.body);
//         res.redirect('/admin/addProducts')
//     }
//        const value= await joiProductSchema.validateAsync(req.body)
//        const {name,description,price,categories,image,stock} = value
//          await products.create(
//              {name:name,
//              description:description,
//              price:price,
//              categories:categories,
//              image:image,
//              stock:stock,
//              is_listed:true,
//              size:['s','xs']
//              })
//                  res.redirect('/admin/productList')
       
//     } catch (error) {
//         console.log(error.message)
//     }
// }


const addProducts = async (req, res) => {
    try {

        const value = await joiProductSchema.validateAsync(req.body);
        const { name, description, price, categories, stock } = value;

        if (!req.files || req.files.length === 0) {
            throw new Error('"image" is required');
        }

        const images = req.files.map(file => ({
            public_id: file.cloudinary_public_id,
            url: file.cloudinary_url
        }));

        await products.create({
            name,
            description,
            price,
            categories,
            image: images,
            stock,
            is_listed: true,
            size: ['s', 'xs']
        });

        res.redirect('/admin/productList');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('An error occurred');
    }
};

const handleFileUpload = async (req, res, next) => {
    try {
        let uploadCount = 0;
        req.files.forEach((file, index) => {
            cloudinary.uploader.upload_stream({ folder: "products", transformation: [
                { width: 768, height: 1152, crop: "fill" }, 
              ] }, (error, result) => {
                if (error) {
                    return next(error);
                }
                file.cloudinary_public_id = result.public_id;
                file.cloudinary_url = result.secure_url;
                uploadCount++;
                if (uploadCount === req.files.length) {
                    next();
                }
            }).end(file.buffer);
        });
    } catch (error) {
        next(error);
    }
};

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
            const messages = req.flash('messages')[0] || {}; 
            const formData = req.flash('formData')[0] || {};
            res.render('editProducts',{categories:categoryData,products:productData,messages,formData})
        }else{
            res.redirect('/admin/productList');
        }
    }catch(error){
        console.log(error.message);
    }
}

// const updateProducts = async (req,res)=>{
//     try {
//         const productId = req.body.id
//         const productData = await products.findById(req.body.id);
            
//         if (!mongoose.Types.ObjectId.isValid(productId)) {
//             console.log('Invalid product ID')
//         }
//         const { error } = joiProductSchema.validate(req.body, {
//             abortEarly: false
//           });
//     if(error){ 
//         const errorMessages = error.details.reduce((acc, cur) => {
//             acc[cur.context.key] = cur.message;
//             return acc;
//         }, {});
//         req.flash('messages', errorMessages);
//         req.flash('formData', req.body);
//         req.flash('id',productId)
//         res.redirect(`/admin/editproducts?id=${productId}`)
//     }
    

//     const value = await joiProductSchema.validateAsync(req.body)

//     const {name,description,price,categories,image,stock} = value
//         const data = {
//             name : name,
//             description : description,
//             price : price,
//             categories : categories,
//             price: price,
//             stock: stock,
//             image:image
//         }

//         // if(image !==''){
//         //     const imgId = productData.image._id;
//         //     if(imgId){
//         //         await cloudinary.uploader.destroy(imgId)
//         //     }

//         //     const newImage = await cloudinary.uploader.upload(image,file.path,{
//         //         folder:"product-images"
//         //     })
//         //     data.image = {
//         //         _id:newImage._id,
//         //         url:newImage.secure_url
//         //     }
//         // }

//         if(data){
//             const pro = await products.findOneAndUpdate({_id:req.body.id},data);
          
//         res.redirect('/admin/productList')
//         }else{
//             res.render('editProducts',{products:productData,message:'Category already exists'})
//         }
//     } catch (error) {
//         console.log(error.message)
//     }
// }


const updateProducts = async (req, res) => {
    try {
        const productId = req.body.id;
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.log('Invalid product ID');
            return res.status(400).send('Invalid product ID');
        }

        const { error } = joiProductSchema.validate(req.body, { abortEarly: false });
        if (error) { 
            const errorMessages = error.details.reduce((acc, cur) => {
                acc[cur.context.key] = cur.message;
                return acc;
            }, {});
            req.flash('messages', errorMessages);
            req.flash('formData', req.body);
            req.flash('id', productId);
            return res.redirect(`/admin/editproducts?id=${productId}`);
        }

        const value = await joiProductSchema.validateAsync(req.body);
        const { name, description, price, categories, stock } = value;
        const productData = await products.findById(productId);
        
        if (!productData) {
            return res.status(404).send('Product not found');
        }

            productData.name= name;
            productData.description=description;
            productData.price = price;
            productData.categories = categories;
            productData.stock = stock;
        

        if (req.files && req.files.length > 0) {
            // Delete old images from Cloudinary
            for (const image of productData.image) {
                await cloudinary.uploader.destroy(image.public_id);
            }

            // Upload new images to Cloudinary
            const newImages = req.files.map(file => ({
                public_id: file.cloudinary_public_id,
                url: file.cloudinary_url
            }));

            productData.image = newImages;
        }

        await productData.save();

        res.redirect('/admin/productList');
    } catch (error) {
        console.log(error.message);
        res.status(500).send('An error occurred');
    }
};


const productPage = async(req,res)=>{
   try {
    const userId = req.session.user_id
    const queryObj = {...req.query};
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = 12;
    let productQuery =   { is_listed: true }

   

    // ------------------ apply search-------------------------//

    if (queryObj.search && queryObj.search.trim() !== '') {
        const searchPattern = new RegExp(queryObj.search.trim(), 'i').source;
    
        productQuery = {...productQuery,
                 $or: [{ name: { $regex: searchPattern } }, { description: { $regex: searchPattern } }] ,
        };
    }
    // ---------------------apply sort--------------------------//

    const sortOptions = {
        Latest: {_id:-1},
        PriceHighTolow : {price:-1},
        PriceLowtoHigh: { price:1},
        aToz:{name:1},
        zToa:{name:-1}
    }
    

    const sort = sortOptions[req.query.sort] || {name:1}
    let productData = await products.find(productQuery).populate({ path: 'categories', model: 'categories' }).populate('offer').sort(sort);

    
    // -----------------------Apply pagination--------------------//
productData = productData.slice((page - 1) * limit, page * limit);
    const count = await products.countDocuments(productQuery);
    const cartData = await Cart.findOne({userId:req.session.user_id}).populate('userId').populate({path:'products.productId'});
    const wishlistData = await Wishlist.findOne({userId:req.session.user_id}).populate('userId').populate('products.productId');
    const categoryData = await category.find();
    const offerData = await Offer.find();
    if(offerData ){
        for(const offer of offerData){
           if(offer.offerTypeName === 'Product'){
               const type = offer.product
                const matchingProducts = productData.filter(product=>product._id == type);
                for (const matchingProduct of matchingProducts) {
                   const offerId = offer._id;
                   if(offer.status == true){
                       await products.updateOne({_id:matchingProduct._id},{
                           offer:offerId
                       })
                   }
                   
               }
   
           }
        }
       }
    

    res.render('products',{products:productData,cartData,wishlistData,categoryData,totalPages:Math.ceil(count/limit),currentPage:page,userId});
    
   } catch (error) {
    console.log(error)
   }
}


// ---------------------------- filter products---------------------------//
const filterProduct = async (req, res) => {
    try {

        let categoryData;
        let productData;
        const selectedCategories = req.query.category.split(',');
        if (selectedCategories && selectedCategories.length > 0) {
            categoryData = await category.find({name:{$in:selectedCategories}})

              const ids = categoryData.filter(doc => doc._id)
           productData = await products.find({categories:{$in:ids}}).populate({ path: 'categories', model: 'categories' }).populate('offer')
        } else {

            productData = await products.find().populate({ path: 'categories', model: 'categories' }).populate('offer');
        }
        
        res.json({ success: true, data: productData });
        
    } catch (error) {
        console.log(error.message);
        res.render("404");
    }
}


const productDetails = async (req, res) => {
    try {
        const { id } = req.query;
        const userId = req.session.user_id;
        let productData = await products.findById({ _id: id });
        const wishlistData = await Wishlist.findOne({ userId: req.session.user_id }).populate('userId').populate('products.productId');
        const cartData = await Cart.findOne({ userId: req.session.user_id }).populate('userId').populate({ path: 'products.productId' });
        const offerData = await Offer.find();

        if (offerData) {
            for (const offer of offerData) {
                if (offer.offerTypeName === 'Product') {
                    if (productData._id.equals(offer.product)) {
                        const offerId = offer._id;
                        if (offer.status === true) {
                            const updatedProduct = await products.updateOne({ _id: productData._id }, { offer: offerId });
                            productData = await products.findById({ _id: id }).populate('offer'); 
                        }
                    }
                }
            }
        }

        res.render('productDetail', { products: productData, cartData, wishlistData, userId });
    } catch (error) {
        console.log(error.message);
    }
};


const loadBestSellingProducts = async(req,res)=>{
    try {
Order.aggregate([
    { $unwind: "$products" },
    {
        $group: {
            _id: "$products.productId",
            totalQuantity: { $sum: "$products.quantity" }
        }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 }
])
.then(results => {
    results.forEach(product => {
        console.log(`Product ID: ${product._id}, Total Quantity: ${product.totalQuantity}`);
    });
})
.catch(error => {
    console.error("Error:", error);
});

    } catch (error) {
        console.log(error.message);
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
    productDetails,
    filterProduct,
    loadBestSellingProducts,
    handleFileUpload,
    upload
}
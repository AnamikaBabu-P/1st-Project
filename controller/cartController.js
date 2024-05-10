const User = require('../models/userModel')
const Cart = require('../models/cartModel');
const Product = require('../models/productsModel');
const Wishlist = require('../models/wishlistModel');
const Offer = require('../models/offerModel');

const loadCart = async(req,res)=>{
    try {
        if(!req.session.user_id){

            console.log('please login to get our service')
            req.flash('cart','Please login to get our service')
            res.json({login:true});
           return res.redirect('/login')
        }else{

            const userId = req.session.user_id;
            const cartData = await Cart.findOne({userId:userId}).populate('userId').populate({path:'products.productId',populate:{ path:'offer' }});
            const wishlistData = await Wishlist.findOne({userId:req.session.user_id}).populate('userId').populate('products.productId');

            let subTotal = 0;
            let totalAmount = 0 ;
               cartData.products.forEach(value=>{
                  
                if(value.productId.offer && value.productId.offer.status == true){
                    const offer = value.productId.offer.offerPrice;
                    totalAmount = value.productPrice * value.quantity
                    totalAmount  = totalAmount-(totalAmount * offer)/100;
                    value.totalPrice = totalAmount
                    subTotal += totalAmount;
                }else{
                    totalAmount = value.productPrice * value.quantity
                    value.totalPrice = totalAmount
                    subTotal += totalAmount;
                }
               })  
             await cartData.save()
                res.render('cart',{cartData, subTotal,wishlistData});
            }

    }catch (error){
        console.log(error.message);
    }
}

const addtoCart = async(req,res)=>{
    try {
        const {productId,productQuantity} = req.body;
        const productData = await Product.findById({_id:productId}).populate('offer');
        const cartData = await Cart.findOne({userId:req.session.user_id});
        
        if(!req.session.user_id){
               res.json({login:true})
        }else{
        
        if(cartData){
            const existProduct = cartData.products.find((pro)=>pro.productId.toString() == productId);
            if(existProduct){
                res.json({success:false})
            } else{
                

            await Cart.findOneAndUpdate({
                userId :req.session.user_id
            },{
                $push: {
                    products:{
                        productId : productId,
                        quantity :productQuantity,
                        productPrice : productData.price,
                        totalPrice : productQuantity* productData.price
                    }
                }
            })
        }
    }else{
        const newCart = new Cart ({
            userId : req.session.user_id,
            products : [
                {
                    productId : productId,
                    quantity : productQuantity,
                    productPrice : productData.price,
                    totalPrice : productQuantity* productData.price,
                    
                }
            ]
           
            // subTotal:products.totalPrice.forEach((item,index)=>{item*index})
           
        })
        
        await newCart.save();
    }

    res.json({success:true});
    
}
    } catch (error) {
        console.log(error.message);
    }   
}

const updatequantity = async(req,res)=>{
    try {
        const {productId,productQuantity} = req.body;
        const cartData = await Cart.findOne({userId:req.session.user_id}).populate({path:'products.productId',populate:{ path:'offer' }});
        
        const products = cartData.products.find((product)=>product.productId.equals(productId))
        
        products.quantity=productQuantity
           
            if(products.productId.offer && products.productId.offer.status === true){
                const offer = products.productId.offer.offerPrice;
                products.totalPrice = products.productPrice*productQuantity;
                products.totalPrice  = products.totalPrice -(products.totalPrice * offer)/100;

            }else{
                products.totalPrice  = products.productPrice*productQuantity
            }
     

       const subTotal = cartData.products.reduce((total,products)=>total + products.totalPrice,0)
       
        await cartData.save();
        res.status(200).json({ status: 'success', message: 'Quantity updated successfully',totalPrice:products.totalPrice ,subTotal});

    } catch (error) {
        console.log(error.message);
    }
}

const deleteCartItem = async(req,res)=>{
    try {
        const {productId} = req.body;
        const cartData = await Cart.findOneAndUpdate({userId: req.session.user_id},{$pull:{products:{productId}}} )

    } catch (error) {
        console.log(error.message);
        
    }
}

const loadCheckOut = async(req,res)=>{
   try {

      const {total} = req.query;
      console.log('totals',total);
      
      const userId = req.session.user_id;
      const user = await User.findById(userId);
      const addresses = user.addresses;

      const cartData = await Cart.findOne({userId:userId}).populate({path:'products.productId'});
      const wishlistData = await Wishlist.findOne({userId:req.session.user_id}).populate('userId').populate('products.productId');
      if(cartData.products.length<=0){
        res.redirect('/cart'); 
      }else{
        const subTotal = req.flash('subTotal')[0]||total;
        const discoundAmount = req.flash('discoundAmount')[0]|| 0;
        console.log('diddddddddd',discoundAmount);
        const totalAfterDiscound =  req.flash('totalAfterDiscound')[0] || subTotal;
        console.log('tttttoooot',totalAfterDiscound);
        res.render('checkout',{cartData,subTotal,addresses:addresses,totalAfterDiscound,wishlistData,discoundAmount});
      }
     
   } catch (error) {
    console.log(error.message);
   }
}


module.exports = {
    loadCart,
    addtoCart,
    updatequantity,
    deleteCartItem,
    loadCheckOut
}
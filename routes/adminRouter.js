var express = require('express');
var adminRouter = express();
const session= require('express-session');
const multer = require('multer');
const path = require('path');


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const config=require('../config/config');
adminRouter.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}));

const {isLogin,isLogout} = require('../middleware/adminAuth')

const imageUpload = require('../middleware/imageUploader');

adminRouter.use(express.json());
adminRouter.use(express.urlencoded({extended:true})); 



adminRouter.set('view engine','ejs');
adminRouter.set('views','./views/admin');

const adminController=require('../controller/adminController')
const productController=require('../controller/productController')
const categoryController=require('../controller/categoryController');
const orderController = require('../controller/orderController');
const couponController = require('../controller/couponController');
const offerController = require('../controller/offerController');

adminRouter.get('/',isLogout,adminController.loadLogin);

adminRouter.post('/',adminController.verifyLogin);
adminRouter.get('/home',isLogin,adminController.loadHome);
adminRouter.get('/orderChart',isLogin,adminController.orderChart);

adminRouter.get('/logout',isLogin,adminController.loadSignout);

adminRouter.get('/Categories',isLogin,categoryController.loadCategories);
adminRouter.get('/addCategories',isLogin,categoryController.loadAddCategories);
adminRouter.post('/addCategories',isLogin,categoryController.insertCategory);
adminRouter.get('/listCategory',isLogin,categoryController.listCategory);
adminRouter.get('/editCategories',isLogin,categoryController.editCategoryLoad);
adminRouter.post('/editCategories',isLogin,categoryController.updateCategories);

adminRouter.get('/userList',isLogin,adminController.loadUserList);
adminRouter.get('/blockUser',isLogin,adminController.blockUser);
adminRouter.get('/addUsers',isLogin,adminController.loadAddUsers);
adminRouter.post('/addUsers',isLogin,adminController.addUser);
adminRouter.get('/editUsers',isLogin,adminController.editUserLoad);
adminRouter.post('/editUsers',isLogin,adminController.updateUser);

adminRouter.get('/productList',isLogin,productController.loadProductList);
adminRouter.get('/addProducts',isLogin,productController.loadAddProducts);
adminRouter.post('/addProducts', productController.upload.array('image', 4), productController.handleFileUpload, productController.addProducts);
// adminRouter.post('/addProducts',imageUpload,productController.addProducts);
adminRouter.get('/listProduct',isLogin,productController.listProduct);
adminRouter.get('/editproducts',isLogin,productController.editProductLoad);
// adminRouter.post('/editproducts',isLogin,productController.updateProducts);

adminRouter.post('/editproducts',isLogin, productController.upload.array('image', 4), productController.handleFileUpload, productController.updateProducts);
adminRouter.get('/bestSellingProduct',isLogin,productController.loadBestSellingProducts);

adminRouter.get('/couponList',isLogin,couponController.loadCouponList);
adminRouter.get('/addCoupon',isLogin,couponController.loadAddCoupon);
adminRouter.post('/addCoupon',isLogin,couponController.addCoupon);
adminRouter.get('/deleteCoupon',isLogin,couponController.deleteCoupon);
adminRouter.get('/editCoupon',isLogin,couponController.loadEditCoupon);
adminRouter.post('/editCoupon',isLogin,couponController.editCoupon);

adminRouter.get('/offerList',isLogin,offerController.loadOfferList);
adminRouter.get('/addOffer',isLogin,offerController.loadAddOffer);
adminRouter.post('/addOffer',isLogin,offerController.addOffer);
adminRouter.get('/listOffer',isLogin,offerController.listOffer);
adminRouter.get('/editOffer',isLogin,offerController.loadEditOffer);
adminRouter.post('/editOffer',isLogin,offerController.editOffer);

adminRouter.get('/orderList',isLogin,orderController.loadOrderList);
adminRouter.get('/orderDetail',isLogin, orderController.loadOrderDetails);
adminRouter.post('/returnApproval',isLogin,orderController.returnApproval);

adminRouter.get('/salesReport',isLogin,orderController.salesReport);
adminRouter.post('/filterSalesReport',isLogin,orderController.filterSalesReport);
adminRouter.post('/statusChanged/:orderId',isLogin,orderController.statusChange);
adminRouter.post('/cancelStatusChanged/:orderId',isLogin,orderController.cancelStatusChange)



adminRouter.get('*',function(req,res){
    res.redirect('/admin');
})

module.exports = adminRouter;

const mongoose=require('mongoose');

const productSchema= new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  categories:{
    
    type:mongoose.Schema.Types.ObjectId,
    ref:'categories',
    required:true
    
  },
  price:{
    type:Number,
    required:true
  },
  image:{
    type:Array,
    validate:[arrayLimit,'you can pass only 4 images']
  },
  size:{
    type:Array
  },
  is_listed:{
    type:Boolean,
    required:true
  }

})

function arrayLimit(val){
  return val.length<=4
}

module.exports = mongoose.model('products',productSchema)
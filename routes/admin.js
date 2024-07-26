var express = require('express');
var router = express.Router();
var productHelper=require('../helper/product-helper');
const { response } = require('../app');
/* GET users listing. */
router.get('/adminlogin',(req,res)=>{
  res.render('admin/adminlogin')
  

})
router.get('/adminsignup',(req,res)=>{
  res.render('admin/adminsign')
})
 router.post('/adminsignup',(req,res)=>{
  
  productHelper.signupadmin(req.body).then((response)=>{
    req.session.admin=response.admin
    req.session.admin.Loggedin=true
   // console.log(response)
   res.redirect('/')
  })
 })
 router.post('/adminlogin',(req,res)=>{
  console.log(req.body)
  productHelper.signuplogin(req.body).then((response)=>{
    if(response.status)
    {
      req.session.admin=response.admin
 
      req.session.admin.Loggedin=true
      
       res.redirect('/')
    }
    else{
    res.redirect('/adminlogin')
    req.session.adminLoginerr="Invalid user name or password"
    }

 

  })
  
router.get('/logout',(req,res)=>{
  req.session.admin.Loggedin=null
  res.redirect('/admin/')
})
})
router.get('/', function(req, res, next) {
   productHelper.getAllproduct().then((result)=>{
   // console.log(result)
    res.render('admin/view-product',{result,admin:true})
   })
  
});
router.get('/add-product',(req,res)=>{
  res.render('admin/add-product')
})
router.post('/add-product',(req,res)=>{
 // console.log(req.body)
 // console.log(req.files)
 //console.log(req.body)
  productHelper.addProduct(req.body,(id)=>{
    let image=req.files.Image
   
   
     //console.log(image)
    
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-product')
      }else{
        console.log("error"+err)
      }
    })
  
  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  //console.log(req.body)
  productHelper.deleteProduct(proId).then((response)=>{
    
   //console.log(response)
    res.redirect('/admin/')
    
  })
 
})
router.get('/edit-product/:id',async(req,res)=>{
 let product=await  productHelper.getproduct(req.params.id)

  res.render('admin/edit-product',{product})
})
router.post('/edit-product/:id',(req,res)=>{
  console.log(req.params.id)
  let id=req.params.id
  console.log(req.body)
  productHelper.updateProduct(req.params.id,req.body).then((e)=>{
    console.log(e)
    res.redirect('/admin/view-product')
    let image=req.files.Image
    image.mv('./public/product-images/'+id+'.jpg')
  })
 
})



module.exports = router;

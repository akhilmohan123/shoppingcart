var express = require('express');
var router = express.Router();
var productHelper=require('../helper/product-helper')
var userhelper=require('../helper/user-helpers')

const verifyLogged=(req,res,next)=>{
  if(req.session.user.Loggedin){
next()
  }
  else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/',async function (req, res, next) {
  let user=req.session.user
  let coun=null
  if(req.session.user){
   coun=await userhelper.cartCount(req.session.user._id)
   console.log(coun)
  }

 productHelper.getAllproduct().then((data)=>{


 
  res.render('user/view-products',{data,user,coun})
})
});
router.get('/login',(req,res)=>{
  res.render('user/login')
  

})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
 router.post('/signup',(req,res)=>{
  
  userhelper.doSignup(req.body).then((response)=>{
    req.session.user=response
    req.session.user.Loggedin=true
   // console.log(response)
  })
 })
router.post('/login',(req,res)=>{
  userhelper.doLogin(req.body).then((response)=>{
    if(response.status)
    {
      req.session.user=response.user
 
      req.session.user.Loggedin=true
      
       res.redirect('/')
    }
    else{
    res.redirect('/login')
    req.session.userLoginerr="Invalid user name or password"
    }

 

  })
})
router.get('/cart/:id',verifyLogged,(req,res,next)=>{
 // console.log(req.params._id)
  console.log("api called")
  userhelper.addCart(req.params.id,req.session.user._id).then((data)=>{
    
      res.json({status:true})
   

    
    
  })
})
  router.get('/view-cart',verifyLogged,async(req,res)=>{
    let products=await userhelper.getCart(req.session.user._id)
    let total = await userhelper.totalprice(req.session.user._id)
    //console.log(products)
    //let user=req.session.user
    res.render('user/view-cart',{products,user:req.session.user._id,total})
  })
 router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  
  userhelper.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userhelper.totalprice(req.body.user)
    res.json(response)
  })

 })

router.get('/logout',(req,res)=>{
  req.session.user.Loggedin=null
  res.redirect('/')
})
router.get('/place-order',verifyLogged,async(req,res)=>{
 let total = await userhelper.totalprice(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})
router.post('/place-order',async(req,res)=>{
  console.log(req.userId)
  let products= await userhelper.productlist(req.body.userId)
  let total=await userhelper.totalprice(req.body.userId)
  userhelper.placeOrder(req.body,products,total).then((orderid)=>{
    if(req.body['payment-method']=='COD'){
      res.json({codsuccess:true})
    }else{
   userhelper.generaterazorpar(orderid,total).then((response)=>{
   // console.log(response)
   res.json(response)
   })
    }
  })

  

})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/order',verifyLogged,async(req,res)=>{
 let order=await userhelper.vieworders(req.session.user._id)
 //console.log(order)
 res.render('user/order',{order})
})
router.post('/verify-payment',(req,res)=>{
  console.log(req.body['order[receipt]'])
  userhelper.verifyPayment(req.body).then(()=>{
    userhelper.changepaymentstatus(req.body['order[receipt]']).then(()=>{
      console.log("Successfull")
      res.json({status:true})
    })
    }).catch((err)=>{
      console.log(err)
      res.json({status:false})
  })
})
module.exports = router;

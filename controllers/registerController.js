 import  userModel  from "../models/userModels.js";
import { comparePassword, hashPassword } from "../utilities/authash.js";
import jwt from "jsonwebtoken";
 import orderModel from "../models/orderModels.js"
 export const registerController = async(req,res)=>{
    try{
        //get these attribute
        const {name,email,password,phone,address,answer}=req.body;
        //validation
        if(!name){
            return res.send({message:'Name is required'})
        }
        if(!email){
            return res.send({message:'Email is required'})
        }
        if(!password){
            return res.send({message:'Password is required'})
        }
        if(!phone){
            return res.send({message:'Phone No. is required'})
        }
        if(!address){
            return res.send({message:'address is required'})
        }
        if(!answer){
            return res.send({message:'answer is required'})
        }

        // check the existence of that user
        const  existingUser= await userModel.findOne({email})
        if(existingUser){
            return res.status(200).send({
                success:false,
                message:'Already register  please login'
            })
        }

        // register user
        const hashedPass=await hashPassword(password);
        //save
        const user= await new userModel({name,email,phone,address,password:hashedPass,answer}).save();
        res.status(200).send({
            success:true,
            message:'user register succesfully',
            user
        })

    }catch(error){
        console.log(error);

        res.status(500).send({
            success:false,
            message:'Error in Registration',
            error
        })
    }
      
};

//POST LOGIN
export const loginController=async(req,res)=>{
try{
    const {email,password}=req.body;
    // check the validation
    if(!email||!password){
        res.status(404).send({
            success:false,
            message:'Invalid email or pssword',

    })

}
//check user
const user=await userModel.findOne({email})
if(!user){
    return res.status(404).send({
        sucess:false,
        message:'email is not registered'

    })
    
}

const match =await comparePassword(password,user.password);
if(!match){
    return res.status(200).send({
        sucess:false,
        message:'password is incorrect'

    })
    
    
}

//token

const  token= await jwt.sign({_id:user._id},process.env.jwt_code,{expiresIn:'7d'});
 res.status(200).send({
    success:true,
    message:'Login succesfully',
    user:{
        _id: user._id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        address:user.address,
        role:user.role,


    },
    token,
});
}catch(e){
    res.status(500).send({
        success:false,
        message:'Error in login',
        e:e.message
    })


}


};

//forgot password 

export const forgotPasswordController=async(req,res)=>{
    try{
        const {email,answer,newPassword}=req.body;
        if(!email){
            res.status(404).send({message:'Email is required'})
        }
        if(!answer){
            res.status(404).send({message:'Answer is required'})
        }
        if(!newPassword){
            res.status(404).send({message:'New Password is required'})
        }
        //check
        const user=await userModel.findOne({email,answer});
        //validation
        if(!user){
            return res.status(404).send({
                success:false,
                message:'Incorrect email or answer'
            })
        }

        const hashed=await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id,{password:hashed});
        res.status(200).send({
            success:true,
            message:"Password reset successfully"
        })

    }
    catch(error){
       console.log(error);
       res.status(500).send({
        success:false,
        message:'something went wrong',
        error
       })
    }


}

//Test (user/admin)

export const testController=(req,res)=>{
    try{
        res.send('protected middleware')
    } catch(error){
        console.log(error)
        res.send({error})
    }
   

}

//update-profile

export const updateProfileController=async(req,res)=>{
    try {
        const {name,email,phone,address,password}=req.body;
        const user=await userModel.findById(req.user._id);

        //password
        if (password && password.length < 6) {
            return res.json({ error: "Passsword is required and 6 character long" });
          }
          const hashedPassword = password ? await hashPassword(password):undefined;
          const updatedUser = await userModel.findByIdAndUpdate(
            req.user._id,
            {
              name: name || user.name,
              password: hashedPassword || user.password,
              phone: phone || user.phone,
              address: address || user.address,
            },
            { new: true }
          );
          res.status(200).send({
            success: true,
            message: "Profile Updated SUccessfully",
            updatedUser,
          });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success:false,
            message:'error while updating profile',
            error
           })
    }
}


//orders
export const getOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({ buyer: req.user._id })
        .populate("products", "-photo")
        .populate("buyer", "name");
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };

  //All-orders
export const getAllOrdersController = async (req, res) => {
    try {
      const orders = await orderModel
        .find({})
        .populate("products", "-photo")
        .populate("buyer", "name").sort({createdAt:-1});

      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Geting Orders",
        error,
      });
    }
  };

  // update status

  export const getOrderStatusController=async (req, res) => {
    try {
            const {id}=req.params;
            const {status}=req.body;

      const orders = await orderModel
        .findByIdAndUpdate( id,{status}, { new:true })
        
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error WHile Upadting Order Status",
        error,
      });
    }
  };
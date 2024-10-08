import AdminMenu from '../../Components/Layout/AdminMenu'
import Layout from '../../Components/Layout/layout'
import React , { useEffect, useState} from 'react'
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../../Context/auth';
import { Select } from 'antd';
const { Option}=Select;
const AdminOrders = () => {

    const [status ,setStatus]= useState(["Not Process", "Processing", "Shipped", "deliverd", "cancel"])
    const [orders, setOrders] = useState([]);
    const [auth, setAuth] = useAuth();
    const getAllOrders = async () => {
      try {
        const { data } = await axios.get("/api/v1/auth/allorders");
        setOrders(data);
      } catch (error) {
        console.log(error);
      }
    };
  
    useEffect(()=>{
     if (auth?.token) getAllOrders();
    },[auth?.token])

const handleStatus=async(id,value)=>{
try {
    
const {data}=await axios.put(`/api/v1/auth/orderstatus/${id}`,{status:value});

getAllOrders();

} catch (error) {
    console.log(error)
    
}

}

  return (
    <Layout title={"BuyZee-All Orders"}>
         <div className="container-fluid text-center my-3"> 
      {/* container fluid class make the width 100% at all breakpoint */}
  <div className="row">
    <div className="col-md-3"><AdminMenu /></div>
    <div className="col-md-9">
    <div className="card">
        <h1 className='text-center'>All Orders</h1>

        {orders?.map((o, i) => {
              return (
                <div className="border shadow">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Status</th>
                        <th scope="col">Buyer</th>
                        <th scope="col"> date</th>
                        <th scope="col">Payment</th>
                        <th scope="col">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{i + 1}</td>
                        <td><Select  defaultValue={o?.status} onChange={(value)=>handleStatus(o._id,value)}>
                           { status?.map((s,i)=> (
                            <Option key={i} value={s}>{s}</Option>
                           ))
        }
                            </Select></td>
                        <td>{o?.buyer?.name}</td>
                        <td>{moment(o?.createAt).fromNow()}</td>
                        <td>{o?.payment.success ? "Success" : "Failed"}</td>
                        <td>{o?.products?.length}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="container">
                    {o?.products?.map((p, i) => (
                      <div className="row mb-2 p-3 card flex-row" key={p._id}>
                        <div className="col-md-4">
                          <img
                            src={`/api/v1/product/product-photo/${p._id}`}
                            className="card-img-top"
                            alt={p.name}
                            width="100px"
                            height={"100px"}
                          />
                        </div>
                        <div className="col-md-8">
                          <p>{p.name}</p>
                          <p>{p.description.substring(0, 30)}</p>
                          <p>Price : {p.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

</div>

    </div>
  </div>
</div>


    </Layout>
  )
}

export default AdminOrders

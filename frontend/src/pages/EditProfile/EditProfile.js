import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

export default function EditProfile(){

const navigate = useNavigate();

const [form,setForm] = useState({
 name:"",
 email:"",
 phone:"",
 gender:"",
 dob:"",
});

useEffect(()=>{
 fetchUser();
},[]);

const fetchUser = async () =>{
 const res = await fetch(
   `${process.env.REACT_APP_API_URL}/api/auth/me`,
   {credentials:"include"}
 );

 const data = await res.json();

 setForm({
  name:data.name || "",
  email:data.email || "",
  phone:data.phone || "",
  gender:data.gender || "",
  dob:data.dob || ""
 });
}

const handleChange = (e)=>{
 setForm({
  ...form,
  [e.target.name]:e.target.value
 });
}

const handleSubmit = async (e)=>{
 e.preventDefault();

 const res = await fetch(
   `${process.env.REACT_APP_API_URL}/api/auth/update-profile`,
   {
    method:"PUT",
    headers:{
     "Content-Type":"application/json"
    },
    credentials:"include",
    body:JSON.stringify(form)
   }
 );

 if(res.ok){
  alert("Profile updated successfully");
  navigate("/dashboard");
 }
}

return(

<div className="edit-profile-container">

<h2>Edit Profile</h2>

<form onSubmit={handleSubmit} className="profile-form">

<label>Name</label>
<input
 name="name"
 value={form.name}
 onChange={handleChange}
/>

<label>Email</label>
<input
 name="email"
 value={form.email}
 onChange={handleChange}
/>

<label>Phone</label>
<input
 name="phone"
 value={form.phone}
 onChange={handleChange}
/>

<label>Gender</label>
<select
 name="gender"
 value={form.gender}
 onChange={handleChange}
>
<option value="">Select</option>
<option value="Male">Male</option>
<option value="Female">Female</option>
<option value="Other">Other</option>
</select>

<label>Date of Birth</label>
<input
 type="date"
 name="dob"
 value={form.dob}
 onChange={handleChange}
/>

<button type="submit">
Update Profile
</button>

</form>

</div>

)

}
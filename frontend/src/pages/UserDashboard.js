import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./UserDashboard.css";

export default function UserDashboard(){

const [user,setUser] = useState(null);
const [appointments,setAppointments] = useState([]);
const navigate = useNavigate();

useEffect(()=>{
 fetchUser();
 fetchAppointments();
},[]);

const fetchUser = async () =>{
 const res = await fetch(
   `${process.env.REACT_APP_API_URL}/api/auth/me`,
   {credentials:"include"}
 );

 const data = await res.json();
 setUser(data.user);
}

const fetchAppointments = async () =>{
 const res = await fetch(
   `${process.env.REACT_APP_API_URL}/api/bookings/my`,
   {credentials:"include"}
 );

 if(res.ok){
   const data = await res.json();
   setAppointments(data);
 }
}

return(

<div className="dashboard-container">

<h1 className="dashboard-title">My Dashboard</h1>

{/* USER INFO */}

<div className="dashboard-card user-info">

<h3>User Info</h3>

<p><strong>Name:</strong> {user?.name}</p>
<p><strong>Email:</strong> {user?.email}</p>

<button
 className="edit-btn"
 onClick={() => navigate("/profile/edit")}
>
 Edit Profile
</button>

</div>

{/* APPOINTMENTS */}

<div className="dashboard-card">

<h3>My Appointments</h3>

{appointments.length === 0 ? (
<p>No appointments yet</p>
) : (
appointments.map((appt)=>(
<div key={appt._id} className="appointment-card">

<p><strong>Doctor:</strong> {appt.doctorId?.name}</p>

<p>
<strong>Date:</strong>{" "}
{new Date(appt.bookingDate).toLocaleDateString()}
</p>

<p><strong>Time:</strong> {appt.bookingTime}</p>

<p><strong>Status:</strong> {appt.status}</p>

</div>
))
)}

</div>
</div>

)

}
import React, { useState } from 'react'
import './Register.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import {useAuth} from "../context/AuthContext"
import { toast } from 'react-toastify';



const Register = () => {
    const navigate=useNavigate();
    const {setAuthUser}=useAuth();
    const [loading,setLoading]=useState(false);
    const [inputData,setInputData]=useState({})

    const handleInput=(e)=>{
        setInputData({
            ...inputData,[e.target.id]:e.target.value
        })
    }

    console.log(inputData)

    const handleSubmit=async(e)=>{
        e.preventDefault()
        setLoading(true)
        if(inputData.password !== inputData.
            confirmPassword){
                setLoading(false);
                return toast.error("Password Does Not Match")
            }
        try{
            const register=await axios.post(`/api/auth/register`,inputData)

            const data=register.data;
            if(data.success===false){
                setLoading(false)
                toast.error(data.message);
                console.log(data.message);
            }
            toast.success("SIgnUp SUccessFully")
            localStorage.setItem('chatapp',JSON.stringify(data))
            setAuthUser(data)
            setLoading(false)
            navigate('/login')
        }catch(error){
            setLoading(false)
            console.error(error);
            toast.error(error?.response?.data?.message)

        }

    }

    const selectGender=(selectGender)=>{
        setInputData((prev)=>({
            ...prev,gender:selectGender===inputData.gender ? '':selectGender
        }))
    }

  return (
    <div className="signup-container">
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>SignUp Chatters <img src="./squid game.png" alt="loading"  className='squid'/></h2>

      <label htmlFor="fullname">Full Name</label>
      <input
        type="text"
        id="fullname"
        name="fullname"
        onChange={handleInput}
        required
        placeholder='fullname'
      />

      <label htmlFor="username">Username</label>
      <input
        type="text"
        id="username"
        name="username"
        onChange={handleInput}
        required
        placeholder='username'
      />

      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        onChange={handleInput}
        required
        placeholder='email'
      />

      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        placeholder='password'
        
        onChange={handleInput}
        required
      />

      <label htmlFor="confirmPassword">Confirm Password</label>
      <input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        placeholder='confirm password'
        onChange={handleInput}
        required
      />

      <div className="gender-container">
        <label>Gender</label>
        <div>
          <label htmlFor="male">
            <input
              type="radio"
              id="male"
              name="gender"
              value="male"
                onChange={()=>selectGender('male')}
                checked={inputData.gender==='male'}
              required
            />
            Male
          </label>

          <label htmlFor="female">
            <input
              type="radio"
              id="female"
              name="gender"
              value="female"
              onChange={()=>selectGender('female')}
              checked={inputData.gender==='female'}
            />
            Female
          </label>
        </div>
      </div>

      <button type="submit">{loading ? "loading..":"Sign Up"}</button>

      <div className="register-link">
        <p>
          You have an account? <Link to="/login">SignIn now</Link>
        </p>
      </div>
    </form>
  </div>
  )
}

export default Register
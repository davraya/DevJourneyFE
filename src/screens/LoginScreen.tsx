import React from 'react';
import { useNavigate } from 'react-router-dom';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { login } from "../redux/appSlice";
import { handleCredentialResponse, handleGetUserInfo } from '../api/auth';


const LoginScreen = () => {
    const navigate = useNavigate();

    const dispatch = useDispatch();
const handleLogin = async (credentialResponse: any) => {
    try {
        const userInfo = await handleCredentialResponse(credentialResponse);
        const jwtToken = userInfo.jwtToken;
        console.log("LoginScreen", userInfo);

        console.log("LoginScreen", userInfo.jwtToken);
        localStorage.setItem('token', jwtToken);
        dispatch(login(jwtToken));

        navigate('/home');
    } catch (err) {
        console.error("Login failed:", err);
    }
};


    return(
    <GoogleOAuthProvider clientId="243072454941-d5tf14khd6694kqb4scbk42klabm71h3.apps.googleusercontent.com">
        <GoogleLogin onSuccess={handleLogin} onError={() => console.log("Login Failed")} />
    </GoogleOAuthProvider>)

}

export default LoginScreen;


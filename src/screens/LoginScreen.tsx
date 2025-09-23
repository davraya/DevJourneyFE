import React from 'react';
import { useNavigate } from 'react-router-dom';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { login } from "../redux/appSlice";
import { handleCredentialResponse } from '../api/auth';

import { UserState } from "../redux/states";
import { updateUser } from '../redux/userSlice';



const LoginScreen = () => {
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const handleLogin = async (credentialResponse: any) => {
        try {
            const userInfo = await handleCredentialResponse(credentialResponse);
            const jwtToken = userInfo.jwtToken;

            localStorage.setItem('token', jwtToken);
            dispatch(login(jwtToken));

            const userState: UserState = {
                userId: userInfo.userId,
                name: userInfo.name,
                picture: userInfo.picture,
            
            };
            localStorage.setItem('userId', userState.userId);
            dispatch(updateUser(userState));

        } catch (err) {
            console.error("Login failed:", err);
        }

        navigate('/home');
    };


    return(
    <GoogleOAuthProvider clientId="243072454941-d5tf14khd6694kqb4scbk42klabm71h3.apps.googleusercontent.com">
        <GoogleLogin onSuccess={handleLogin} onError={() => console.log("Login Failed")} />
    </GoogleOAuthProvider>)

}

export default LoginScreen;


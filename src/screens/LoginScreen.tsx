import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { login } from "../redux/appSlice";
import { handleCredentialResponse } from '../api/auth';

import { UserState } from "../redux/states";
import { updateUser } from '../redux/userSlice';



const LoginScreen = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const dispatch = useDispatch();
    const handleLogin = async (credentialResponse: any) => {
        setIsLoading(true);
        setLoadingMessage('Authenticating with Google...');
        
        try {
            // Small delay to show the initial message
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setLoadingMessage('Processing login...');
            const userInfo = await handleCredentialResponse(credentialResponse);
            const jwtToken = userInfo.jwtToken;

            setLoadingMessage('Setting up your account...');
            localStorage.setItem('token', jwtToken);
            dispatch(login(jwtToken));

            const userState: UserState = {
                userId: userInfo.userId,
                name: userInfo.name,
                picture: userInfo.picture,
            };
            localStorage.setItem('userId', userState.userId);
            dispatch(updateUser(userState));

            setLoadingMessage('Redirecting to dashboard...');
            // Small delay before navigation to show the final message
            await new Promise(resolve => setTimeout(resolve, 300));
            
            navigate('/home');
        } catch (err) {
            console.error("Login failed:", err);
            setIsLoading(false);
            setLoadingMessage('');
            // You could add error handling UI here
        }
    };


    return(
        <div className="login-screen">
            <div className="login-container">
                <div className="login-content">
                    <div className="login-header">
                        <div className="login-icon">💻</div>
                        <h1 className="login-title">Dev Journey</h1>
                        <p className="login-subtitle">Track your development progress and interviews</p>
                    </div>
                    
                    <div className="login-form">
                        {isLoading ? (
                            <div className="login-loading">
                                <div className="loading-spinner"></div>
                                <div className="loading-message">{loadingMessage}</div>
                            </div>
                        ) : (
                            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
                                <GoogleLogin 
                                    onSuccess={handleLogin} 
                                    onError={() => console.log("Login Failed")}
                                    theme="outline"
                                    size="large"
                                    text="signin_with"
                                    shape="rectangular"
                                />
                            </GoogleOAuthProvider>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

}

export default LoginScreen;


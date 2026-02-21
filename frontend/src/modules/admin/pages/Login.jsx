import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import SlidingAuthContainer from '../components/auth/SlidingAuthContainer';

export default function Login() {
    return (
        <AuthLayout>
            <SlidingAuthContainer initialMode="signin" />
        </AuthLayout>
    );
}

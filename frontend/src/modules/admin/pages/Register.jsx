import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import SlidingAuthContainer from '../components/auth/SlidingAuthContainer';

export default function Register() {
    return (
        <AuthLayout>
            <SlidingAuthContainer initialMode="signup" />
        </AuthLayout>
    );
}

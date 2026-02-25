import React from 'react';
import StoreAuthLayout from '../../components/auth/StoreAuthLayout';
import StoreSlidingAuthContainer from '../../components/auth/StoreSlidingAuthContainer';

export default function Login() {
    return (
        <StoreAuthLayout>
            <StoreSlidingAuthContainer initialMode="signin" />
        </StoreAuthLayout>
    );
}

import React from 'react';
import StoreAuthLayout from '../../components/auth/StoreAuthLayout';
import StoreSlidingAuthContainer from '../../components/auth/StoreSlidingAuthContainer';

export default function Register() {
    return (
        <StoreAuthLayout>
            <StoreSlidingAuthContainer initialMode="signup" />
        </StoreAuthLayout>
    );
}

import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';
import { RootState } from 'redux/store';

interface PrivateRouteProps {
	children?: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
	const auth = useSelector((state: RootState) => state.auth);

	return auth 
		? 
		<>{children}</> 
		:
		<Navigate to="/login"/>;
}

export default PrivateRoute;
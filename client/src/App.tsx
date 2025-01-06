import { useEffect, useState } from 'react';
import Login from 'pages/login/Login';
import { useSelector,useDispatch } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RootState } from 'redux/store';
import Home from 'pages/asset/Home.tsx';
import PrivateRoute from 'PrivateRoute';
import { addAuth } from './redux/reducers/authReducer.tsx';
import { getErrorMessage } from 'helpers/getErrorMessage';
import app from 'axiosConfig.tsx';
import PageLoading from 'widgets/PageLoading.tsx';

function App() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [fetchingData,setFetchingData] = useState(false);

  const checkAuth = async () => {
    try {
      setFetchingData(true);
      const {data}:any = await app.get("/api/check-auth");
      if(data?.data?.length>0){
        dispatch(addAuth(data.data[0]))
      }
    } catch (error:any) {
      alert(getErrorMessage(error))
    } finally {
      setFetchingData(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);
  
  return (
    <>
      {
        fetchingData 
        ?
        <PageLoading/>
        :
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={auth ? <Navigate to="/" /> : <Login/>}/>
            <Route path="/" element={<PrivateRoute><Home/></PrivateRoute>}/>
          </Routes>
        </BrowserRouter>
      }
    </>
  );
}

export default App;

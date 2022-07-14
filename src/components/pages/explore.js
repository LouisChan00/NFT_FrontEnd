import React, {useEffect} from 'react';
import ColumnNewRedux from '../components/ColumnNewRedux';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import TopFilterBar from '../components/TopFilterBar';
import {useDispatch} from 'react-redux';
import jwt_decode from "jwt-decode";
import Axios from 'axios';
import { cleanCurrentUser, setCurrentUserAction } from "../../store/actions/thunks";
import api from "../../core/api";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.sticky.white {
    background: #403f83;
    border-bottom: solid 1px #403f83;
  }
  header#myHeader.navbar .search #quick_search{
    color: #fff;
    background: rgba(255, 255, 255, .1);
  }
  header#myHeader.navbar.white .btn, .navbar.white a, .navbar.sticky.white a{
    color: #fff;
  }
  header#myHeader .dropdown-toggle::after{
    color: rgba(255, 255, 255, .5);;
  }
  header#myHeader .logo .d-block{
    display: none !important;
  }
  header#myHeader .logo .d-none{
    display: block !important;
  }
  @media only screen and (max-width: 1199px) {
    .navbar{
      background: #403f83;
    }
    .navbar .menu-line, .navbar .menu-line1, .navbar .menu-line2{
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;

const Explore = () => {

  var dispatch = useDispatch();
  
  useEffect(() => {
    if (localStorage.getItem("jwtToken")) 
    {
      const decoded = jwt_decode(localStorage.getItem("jwtToken"));
      const currTime = Date.now() / 1000;
      if (decoded.app < currTime) {
        dispatch(cleanCurrentUser());
        localStorage.removeItem("jwtToken");
      }
      else {
        //   console.log("decoded : ", decoded);
        //   console.log("index.js before call setCurrentUserInfoById()");    
        let filter = decoded.id ? '/' + decoded.id : '';
        Axios.get(`${api.baseUrl}${api.users}${filter}`, {}, {
        })
          .then(function (response) {
            dispatch(setCurrentUserAction(response.data));
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(function () {
            // always executed
          });
      }
    }
  }, [dispatch]);

  return (
    <div>
      <GlobalStyles />

      <section className='jumbotron breadcumb no-bg' style={{ backgroundImage: `url(${'./img/background/subheader.jpg'})` }}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Explore</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>
        <div className='row'>
          <div className='col-lg-12'>
            <TopFilterBar />
          </div>
        </div>
        <ColumnNewRedux />
      </section>


      <Footer />
    </div>

  );
}
export default Explore;
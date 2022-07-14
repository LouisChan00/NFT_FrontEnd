import React from "react";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { useSelector } from 'react-redux';
import api from '../../core/api';
import * as selectors from '../../store/selectors';


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
    color: rgba(255, 255, 255, .5);
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
      background: #111;
    }
    .item-dropdown .dropdown a{
      color: #111 !important;
    }
  }
`;

const MyProfile = () => {
  const currentUser = useSelector(selectors.currentUser);

  return (
    <div>
      <GlobalStyles />

      <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'/img/background/subheader.jpg'})`}}>
        <div className='mainbreadcumb'>
          
            <div className='row m-10-hor'>
              <div className='col-12 text-center'>
                <h1>My profile</h1>
              </div>
            </div>
          
        </div>
      </section>
          
          <div className="col-md-12" style={{ display: 'flex', margin: 'auto', width: 200, flexWrap: 'wrap', }}>
            {currentUser.avatar &&
              <img style={{ borderRadius: '50%' }} src={`${api.baseUrl}${currentUser.avatar.url}`} width="180px" height="180px" alt="Avatar" loading="lazy" />
            }
          </div>
          <p></p>
          <p></p>
          <div name="contactForm" id='contact_form' className="form-border" action='#'>

            <div className="row">
              <div className="col-md-2 offset-md-4"><h5>Name:</h5></div>
              <div className="col-md-4"><h6>{currentUser.name || ''}</h6> </div>
            </div>
            <p></p>
            <div className="row">
              <div className="col-md-2 offset-md-4"><h5>Username:</h5></div>
              <div className="col-md-4"><h6>{currentUser.username || ''}</h6></div>
            </div>
            <p></p>
            <div className="row">
              <div className="col-md-2 offset-md-4"><h5>Email Address:</h5></div>
              <div className="col-md-6"><h6>{currentUser.email || ''}</h6></div>
            </div>
            <p></p>
            <div className="row">
              <div className="col-md-2 offset-md-4"><h5>Social:</h5></div>
              <div className="col-md-6"><h6>{currentUser.social || ''}</h6></div>
            </div>
            <p></p>
            <div className="row">
              <div className="col-md-2 offset-md-4"><h5>Wallet:</h5></div>
              <div className="col-md-6"><h6>{currentUser.wallet || ''}</h6></div>
            </div>
            <p></p>
            <div className="row">
              <div className="col-md-2 offset-md-4"><h5>Summary:</h5></div>
            </div>
            <div className="row">
              <div className="col-md-6 offset-md-4"><h6>{currentUser.about}</h6></div>
            </div>
            <p></p>
            <div className="row">
              <div className="col-md-2 offset-md-4"><h5>Banner:</h5></div>
            </div>
            <div className="row">
              <div className="col-md-12" style={{ display: 'flex', margin: 'auto', width: 600, flexWrap: 'wrap', align:'center'}}>
                {
                  currentUser.banner &&
                  <img src={`${api.baseUrl}${currentUser.banner.url}`} width="auto" height="auto" alt="Avatar" loading="lazy" />
                }
              </div>
            </div>

          </div>

      <Footer />
    </div>
  );
}

export default MyProfile;

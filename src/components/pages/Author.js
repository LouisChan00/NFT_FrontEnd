import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import ColumnNewRedux from '../components/ColumnNewRedux';
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import * as selectors from '../../store/selectors';
import { fetchAuthorList } from "../../store/actions/thunks";
import api from "../../core/api";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
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

const Colection = ({ authorId }) => {
const [openMenu, setOpenMenu] = React.useState(true);
const [openMenu1, setOpenMenu1] = React.useState(false);
const [openMenu2, setOpenMenu2] = React.useState(false);
const [nftStatus, setNftStatus] = useState("");
const [nftSituation, setNftSituation] = useState("minted");

const handleBtnClick = () => {
  setOpenMenu(!openMenu);
  setOpenMenu1(false);
  setOpenMenu2(false);
  setNftStatus(""); 
  setNftSituation("minted");
  document.getElementById("Mainbtn").classList.add("active");
  document.getElementById("Mainbtn1").classList.remove("active");
  document.getElementById("Mainbtn2").classList.remove("active");
};

const handleBtnClick1 = () => {
  setOpenMenu1(!openMenu1);
  setOpenMenu2(false);
  setOpenMenu(false);
  setNftStatus("normal"); 
  setNftSituation("saled");
  document.getElementById("Mainbtn1").classList.add("active");
  document.getElementById("Mainbtn").classList.remove("active");
  document.getElementById("Mainbtn2").classList.remove("active");
};

const handleBtnClick2 = () => {
  setOpenMenu2(!openMenu2);
  setOpenMenu(false);
  setOpenMenu1(false);
  setNftStatus(""); 
  setNftSituation("created");
  document.getElementById("Mainbtn2").classList.add("active");
  document.getElementById("Mainbtn").classList.remove("active");
  document.getElementById("Mainbtn1").classList.remove("active");
};

const dispatch = useDispatch();
const authorsState = useSelector(selectors.authorsState);
const author = authorsState.data ? authorsState.data[0] : {};

useEffect(() => {
  dispatch(fetchAuthorList(authorId));
}, [dispatch, authorId]);

return (
<div>
<GlobalStyles/>
    { author && 
      <section id='profile_banner' className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${author.banner ? (api.baseUrl + author.banner.url) : '/img/banner.jpg' })`}}>
        <div className='mainbreadcumb'>
        </div>
      </section>
    }

    <section className='container d_coll no-top no-bottom'>
      <div className='row'>
        <div className="col-md-12">
          <div className="d_profile">
            <div className="profile_avatar">
                { author.avatar &&
                  <div className="d_profile_img">
                    <img src={(author && author.avatar ? api.baseUrl + author.avatar.url : '/img/avatar.jpg')}  alt=""/>
                    <i className="fa fa-check"></i>
                  </div>
                }
                <div className="profile_name">
                  <h4>
                      { author.name }                                                
                      <div className="clearfix"></div>
                      { author &&  author.wallet &&
                        <span id="wallet" className="profile_wallet">{ author.wallet }</span>
                      }
                      <button id="btn_copy" title="Copy Text">Copy</button>
                  </h4>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>

  <section className='container no-top'>
        <div className='row'>
          <div className='col-lg-12'>
              <div className="items_filter">
                <ul className="de_nav text-left">
                    <li id='Mainbtn' className="active"><span onClick={handleBtnClick}>On Sale</span></li>
                    <li id='Mainbtn1' className=""><span onClick={handleBtnClick1}>Owned</span></li>
                    <li id='Mainbtn2' className=""><span onClick={handleBtnClick2}>Created</span></li>
                </ul>
            </div>
          </div>
        </div>
      {openMenu &&  authorId && (  
        <div id='zero1' className='onStep fadeIn'>
         <ColumnNewRedux shuffle showLoadMore={false} authorId={authorId } status={nftStatus} situation={nftSituation} />
        </div>
      )}
      {openMenu1 && authorId && ( 
        <div id='zero2' className='onStep fadeIn'>
         <ColumnNewRedux shuffle showLoadMore={false} authorId={authorId } status={nftStatus} situation={nftSituation} />
        </div>
      )}
      {openMenu2 && authorId && ( 
        <div id='zero3' className='onStep fadeIn'>
         <ColumnNewRedux shuffle showLoadMore={false}  authorId={authorId }  status={nftStatus} situation={nftSituation}  />
        </div>
      )}
      </section>

  <Footer />
</div>
);
}
export default memo(Colection);
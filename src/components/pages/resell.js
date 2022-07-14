import React, { useEffect, useState } from "react";
import Select from 'react-select';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import swal from 'sweetalert';
import { NotificationManager } from 'react-notifications';
import Clock from "../components/Clock";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { navigate } from "@reach/router";
import { categories } from '../components/constants/filters';
import api from "../../core/api";
import { useDispatch, useSelector } from "react-redux";
import * as selectors from '../../store/selectors';
import { fetchNftDetail } from "../../store/actions/thunks";
import { reselllingNFTAction } from "../../store/actions/thunks";

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
      background: #fff;
    }
    .item-dropdown .dropdown a{
      color: #fff !important;
    }
  }
`;

const customStyles = {
  option: (base) => ({
    ...base,
    background: "#fff",
    color: "#333",
    "&:hover": {
      background: "#eee",
    }
  }),
  menu: base => ({
    ...base,
    borderRadius: 0,
    marginTop: 0
  }),
  menuList: base => ({
    ...base,
    padding: 0
  }),
  control: (base, state) => ({
    ...base,
    padding: 2
  })
};

const Resell = ({nftId}) => {

  const dispatch = useDispatch();
  const currentUser = useSelector(selectors.currentUser);
  const isAuthorized = useSelector(selectors.isAuthorized);
  const consideringNFT = useSelector(selectors.nftDetailState).data;
  
  useEffect(() => {
    dispatch(fetchNftDetail(nftId));
  }, [nftId, dispatch]);

  const [isActive, setIsActive] = useState(false);
  const [method, setMethod] = useState('buy_now');  
  const [token_type, setTokenType] = useState('BNB');
  // const loading =  false;
  var fields = {};
  var errors ={};
  if(consideringNFT) fields = consideringNFT;

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) {
      swal({
        title: "Warning",
        text: "You can't mint. Please sign in!",
        icon: "warning",
      }).then(() => {
        navigate('/login');
      });
    }
  }, []);

  const handleShow = () => {
    document.getElementById("tab_opt_1").classList.add("show");
    document.getElementById("tab_opt_1").classList.remove("hide");
    document.getElementById("tab_opt_2").classList.remove("show");
    document.getElementById("btn1").classList.add("active");
    document.getElementById("btn2").classList.remove("active");
    document.getElementById("btn3").classList.remove("active");
    setMethod('buy_now');
  }
  const handleShow1 = () => {
    document.getElementById("tab_opt_1").classList.add("hide");
    document.getElementById("tab_opt_1").classList.remove("show");
    document.getElementById("tab_opt_2").classList.add("show");
    document.getElementById("btn1").classList.remove("active");
    document.getElementById("btn2").classList.add("active");
    document.getElementById("btn3").classList.remove("active");
    setMethod('on_auction');
  }
  const handleShow2 = () => {
    document.getElementById("tab_opt_1").classList.add("hide");
    document.getElementById("tab_opt_2").classList.add("hide");
    document.getElementById("tab_opt_1").classList.remove("show");
    document.getElementById("tab_opt_2").classList.remove("show");
    document.getElementById("btn1").classList.remove("active");
    document.getElementById("btn2").classList.remove("active");
    document.getElementById("btn3").classList.add("active");
    setMethod('has_offers');
  }

  const handleTokenType = (e) => {
    setTokenType(e.target.value);
  }

  const handleValidation = () => {

    var formIsValid = true;

    console.log("handleValidation 0");
    if (!fields.category) {
      formIsValid = false;
      errors = {...errors, category : "Cannot be empty"};
    }

    if (method === 'buy_now' && !fields.price) {
      formIsValid = false;
      errors = {...errors, price : "Cannot be empty"};
    }

    if (method === 'on_auction' && !fields.priceover) {
      formIsValid = false;
      errors = {...errors, priceover : "Cannot be empty"};
    }

    if (method === 'on_auction' && !fields.start_date) {
      formIsValid = false;
      errors = {...errors, start_date : "Cannot be empty"};
    }

    if (method === 'on_auction' && !fields.deadline) {
      formIsValid = false;
      errors = {...errors, deadline : "Cannot be empty"};
    }

    if (isActive && !fields.item_unlock) {
      formIsValid = false;
      errors = {...errors, item_unlock : "Cannot be empty"};
    }

    if (!fields.title) {
      formIsValid = false;
      errors = {...errors, title : "Cannot be empty"};
    }

    if (!fields.description) {
      formIsValid = false;
      errors = {...errors, description : "Cannot be empty"};
    }

    if (!fields.royalties) {
      formIsValid = false;
      errors = {...errors, royalties : "Cannot be empty"};
    }

    console.log("handleValidation 1");
    console.log("errors : ", errors);

    return formIsValid;
  }

  const handleCategory = (e) => {
    fields = {...fields, "category" : e.value};
    console.log("[wts - handleChange] : fields = ", fields);
  }

  const handleChange = (e) => {
    fields = {...fields, [e.target.name] : e.target.value};
    console.log("[wts - handleChange] : fields = ", fields);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      NotificationManager.warning("Please sign in.", "Warning", 3000,
        function () {
          navigate('/home');
        });
      return;
    }
    if (!currentUser || (currentUser && currentUser.role.type === 'public')) {
      NotificationManager.warning("Please contact an manager. You have no permission to create NFT.", "Warning");
      return;
    }

    console.log("before handleValidation");
    if (handleValidation()) {
      console.log("after handleValidation");
      // setState({'loading': true});
      const param = {
        category: fields.category,
        status: method,
        deadline: fields.deadline,
        title: fields.item_title,
        price: fields.price,
        description: fields.description,
        priceover: fields.priceover,
        author: currentUser.author ? currentUser.author.id : 1,
        token_type: token_type,
        royalties : fields.royalties,
        situation: "minted"
      };
      dispatch(reselllingNFTAction(param, nftId));
      NotificationManager.success("Reselling operation succeed.", "Success");
      navigate("/explore");
    }
  }

  const unlockClick = () => {
    setIsActive(true);
  }

  const unlockHide = () => {
    setIsActive(false);
  };

  let message = '';

  if (!currentUser || (currentUser.role && currentUser.role.type === 'public')) {
    message = `You can't create NFT.<br/>You have no permission to create NFT. Please contact an manager.`;
  }
  return (
    <div>
      <GlobalStyles />

      <section className='jumbotron breadcumb no-bg' style={{ backgroundImage: `url(${'/img/background/subheader.jpg'})` }}>
        <div className='mainbreadcumb'>
          <div className='container'>
            <div className='row m-10-hor'>
              <div className='col-12'>
                <h1 className='text-center'>Resell</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='container'>

        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
            <form id="form-create-item" className="form-border" >
              {message && (
                <div className="alert alert-danger" role="alert" dangerouslySetInnerHTML={{ __html: message }}></div>
              )}
              <div className="field-set">

                <h5>Select method</h5>
                <div className="de_tab tab_methods">
                  <ul className="de_nav">
                    <li id='btn1' className="active" onClick={() => handleShow()}><span><i className="fa fa-tag"></i>Fixed price</span>
                    </li>
                    <li id='btn2' onClick={() => handleShow1()}><span><i className="fa fa-hourglass-1"></i>Timed auction</span>
                    </li>
                    <li id='btn3' onClick={() => handleShow2()}><span><i className="fa fa-users"></i>Open for bids</span>
                    </li>
                  </ul>

                  <div className="de_tab_content pt-3">
                    <div id="tab_opt_1">
                      <h5>Price</h5>
                      <div className="row">
                        <div className="col-md-8">
                          <input type="number" name="price" id="price" 
                            onChange={(e) => handleChange(e)} 
                            defaultValue={consideringNFT && consideringNFT.price ? consideringNFT.price : 0}
                            className="form-control mb-2" placeholder="enter price for one item" step="any" />
                          <span style={{ color: "red" }}>{errors["price"]}</span>
                        </div>
                        <div className="col-md-4">
                        <RadioGroup row aria-label="token_type" 
                            defaultValue={consideringNFT && consideringNFT.token_type ? consideringNFT.token_type: "BNB"} 
                            name="row-radio-buttons-group" style={{ float: 'right' }} onChange={() => handleTokenType()}
                          >
                            <FormControlLabel value="BNB" control={<Radio />} label="BNB" />
                            <FormControlLabel value="SPC" control={<Radio />} label="SPC" />
                          </RadioGroup>
                        </div>
                      </div>
                    </div>

                    <div id="tab_opt_2" className='hide'>
                      <h5>Minimum bid</h5>
                      <div className="row">
                        <div className="col-md-8">
                          <input type="number" name="priceover" id="priceover" 
                            onChange={(e) => handleChange(e)} 
                            defaultValue={consideringNFT && consideringNFT.priceover ? consideringNFT.priceover : 0}
                            className="form-control mb-2" placeholder="enter minimum bid" />
                          <span style={{ color: "red" }}>{errors["priceover"]}</span>
                        </div>
                        <div className="col-md-4">
                          <RadioGroup row aria-label="token_type" 
                            defaultValue={consideringNFT && consideringNFT.token_type ? consideringNFT.token_type: "BNB"} 
                            name="row-radio-buttons-group" style={{ float: 'right' }} onChange={() => handleTokenType()}
                          >
                            <FormControlLabel value="BNB" control={<Radio />} label="BNB" />
                            <FormControlLabel value="SPC" control={<Radio />} label="SPC" />
                          </RadioGroup>
                        </div>
                      </div>
                      <div className="row pt-1">
                        <div className="col-md-6">
                          <h5>Starting date</h5>
                          <input type="date" name="start_date" id="start_date" 
                            onChange={(e) => handleChange(e)} 
                            defaultValue={consideringNFT && consideringNFT.start_date ? consideringNFT.start_date : Date.now() }
                          className="form-control mb-2" min="1997-01-01" />
                          <span style={{ color: "red" }}>{errors["start_date"]}</span>
                        </div>
                        <div className="col-md-6">
                          <h5>Expiration date</h5>
                          <input type="date" name="deadline" id="deadline" 
                            onChange={(e) => handleChange(e)} 
                            defaultValue={consideringNFT && consideringNFT.deadline ? consideringNFT.deadline + Date.now() : Date.now() }
                            className="form-control mb-2" />
                          <span style={{ color: "red" }}>{errors["deadline"]}</span>
                        </div>
                      </div>
                    </div>

                    <div id="tab_opt_3">
                      <div className='de_tab_content dropdownSelect one pt-1'>
                        <h5>Category</h5>
                          <Select 
                              styles={customStyles} 
                              menuContainerStyle={{'zIndex': 999}}
                              options={[...categories]}
                              onChange={(e) => handleCategory(e)}
                              defaultValue={consideringNFT && consideringNFT.category ? consideringNFT.category : "art" }
                          />
                        <span style={{ color: "red" }}>{errors["category"]}</span>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="spacer-20"></div>

                <div className="switch-with-title">
                  <h5><i className="fa fa- fa-unlock-alt id-color-2 mr10"></i>Unlock once purchased</h5>
                  <div className="de-switch">
                    <input type="checkbox" id="switch-unlock" className="checkbox" />
                    {isActive ? (
                      <label htmlFor="switch-unlock" onClick={() => unlockHide()}></label>
                    ) : (
                      <label htmlFor="switch-unlock" onClick={() => unlockClick()}></label>
                    )}
                  </div>
                  <div className="clearfix"></div>
                  <p className="p-info pb-3">Unlock content after successful transaction.</p>

                  {isActive ?
                    <div id="unlockCtn" className="hide-content">
                      <input type="text" name="item_unlock" id="item_unlock" 
                      onChange={(e) => handleChange(e)} 
                      className="form-control mb-2" placeholder="Access key, code to redeem or link to a file..." />
                      <span style={{ color: "red" }}>{errors["item_unlock"]}</span>
                    </div>
                    : null}
                </div>

                <h5>Title</h5>
                <input type="text" name="item_title" id="item_title" 
                  onChange={(e) => handleChange(e)} 
                  defaultValue={consideringNFT && consideringNFT.title ? consideringNFT.title  : "" }
                  className="form-control mb-2" placeholder="e.g. 'Crypto Funk" />
                <span style={{ color: "red" }}>{errors["item_title"]}</span>

                <div className="spacer-10"></div>

                <h5>Description</h5>
                <textarea data-autoresize name="description" id="description" 
                  onChange={(e) => handleChange(e)} 
                  defaultValue={consideringNFT && consideringNFT.description ? consideringNFT.description  : "" }
                  className="form-control mb-2" placeholder="e.g. 'This is very limited item'"></textarea>
                <span style={{ color: "red" }}>{errors["description"]}</span>

                <div className="spacer-10"></div>

                <h5>Royalties</h5>
                <input type="number" name="royalties" id="royalties" 
                  onChange={(e) => handleChange(e)} 
                  defaultValue={consideringNFT && consideringNFT.royalties ? consideringNFT.royalties  : "" }
                  className="form-control mb-2" placeholder="suggested: 0, 10%, 20%, 30%. Maximum is 70%" step="any" />
                <span style={{ color: "red" }}>{errors["royalties"]}</span>

                <div className="spacer-10"></div>

                <button id="submit" onClick={(e) => handleSubmit(e)} className="btn-main">Create Item</button>
              </div>
            </form>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
            <h5>Preview item</h5>
            <div className="nft__item m-0">
              {method === "on_auction" && fields.deadline && (
                <div className="de_countdown">
                  <Clock deadline={fields.deadline} />
                </div>
              )}
              <div className="author_list_pp">
                <span>
                  <img className="lazy" src={(currentUser && currentUser.avatar ? api.baseUrl + currentUser.avatar.url : '/img/avatar.jpg')} alt="" />
                  <i className="fa fa-check"></i>
                </span>
              </div>
              <div className="nft__item_wrap">
                <span>
                  <img src={api.baseUrl + (consideringNFT && (consideringNFT.preview_image ? consideringNFT.preview_image.url: ''))} id="get_file_2" className="lazy nft__item_preview" alt="" />
                </span>
              </div>
              <div className="nft__item_info">
                <span >
                  <h4>{fields.item_title}</h4>
                </span>
                {method === 'buy_now' && fields.price && (
                  <div className="nft__price">
                    {fields.price} {token_type}
                  </div>
                )}
                {method === 'on_auction' && fields.priceover && (
                  <div className="nft__price">
                    {fields.priceover} {token_type}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* {<Backdrop
                  sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                  open={loading}
              >
                  <CircularProgress color="inherit" />
              </Backdrop>} */}
        </div>

      </section>

      <Footer />
    </div>
  );

}

export default Resell;

import React, { Component } from "react";
import { connect } from 'react-redux';
import Select from 'react-select';
import Backdrop from '@mui/material/Backdrop';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import swal from 'sweetalert';
import {NotificationManager} from 'react-notifications';
import Clock from "../components/Clock";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import { createSingleNft } from "../../store/actions/thunks";
import { navigate } from "@reach/router";
import { categories } from '../components/constants/filters';
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
  option: (base, state) => ({
      ...base,
      background: "#fff",
      color: "#333",
      borderRadius: state.isFocused ? "0" : 0,
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

class Createpage extends Component {

constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.state = {
      selected_file: null,
      selected_file_url: '',
      files: [],
      method: 'buy_now',
      loading: false,
      token_type: 'BNB',
      fields: {},
      errors: {},
    };
  }

  componentDidMount() {
    if (!localStorage.getItem("jwtToken")) {
      swal({
        title: "Warning",
        text: "You can't mint. Please sign in!",
        icon: "warning",
      }).then(() => {
        navigate('/login');
      });
    }
  }

  onChange(e) {
    var files = e.target.files;
    var filesArr = Array.prototype.slice.call(files);
    document.getElementById("file_name").style.display = "none";
    document.getElementById("get_file_2").src = URL.createObjectURL(files[0]);
    this.setState({ files: [...this.state.files, ...filesArr], selected_file: files[0] });
  }

  handleShow = ()=>{
      document.getElementById("tab_opt_1").classList.add("show");
      document.getElementById("tab_opt_1").classList.remove("hide");
      document.getElementById("tab_opt_2").classList.remove("show");
      document.getElementById("btn1").classList.add("active");
      document.getElementById("btn2").classList.remove("active");
      document.getElementById("btn3").classList.remove("active");
      this.setState({method: 'buy_now'});
  }
   handleShow1 = ()=>{
      document.getElementById("tab_opt_1").classList.add("hide");
      document.getElementById("tab_opt_1").classList.remove("show");
      document.getElementById("tab_opt_2").classList.add("show");
      document.getElementById("btn1").classList.remove("active");
      document.getElementById("btn2").classList.add("active");
      document.getElementById("btn3").classList.remove("active");
      this.setState({method: 'on_auction'});
  }
   handleShow2 = ()=>{
      document.getElementById("tab_opt_1").classList.add("hide");
      document.getElementById("tab_opt_2").classList.add("hide");
      document.getElementById("tab_opt_1").classList.remove("show");
      document.getElementById("tab_opt_2").classList.remove("show");
      document.getElementById("btn1").classList.remove("active");
      document.getElementById("btn2").classList.remove("active");
      document.getElementById("btn3").classList.add("active");
      this.setState({method: 'has_offers'});
  }

  handleTokenType = (e) => {
    this.setState({token_type: e.target.value});
  }

  handleValidation() {
    let { selected_file, fields, method, isActive} = this.state;
    let errors = {};
    let formIsValid = true;

    if (!selected_file) {
      NotificationManager.warning("Please click a image file", "Warning");
      formIsValid = false;
      return formIsValid;
    }
    if (!fields["category"]) {
      formIsValid = false;
      errors["category"] = "Cannot be empty";
    }

    if (method === 'buy_now' && !fields["item_price"]) {
      formIsValid = false;
      errors["item_price"] = "Cannot be empty";
    }

    if (method === 'on_auction' && !fields["priceover"]) {
      formIsValid = false;
      errors["priceover"] = "Cannot be empty";
    }

    if (method === 'on_auction' && !fields["start_date"]) {
      formIsValid = false;
      errors["start_date"] = "Cannot be empty";
    }

    if (method === 'on_auction' && !fields["deadline"]) {
      formIsValid = false;
      errors["deadline"] = "Cannot be empty";
    }

    if (isActive && !fields["item_unlock"]) {
      formIsValid = false;
      errors["item_unlock"] = "Cannot be empty";
    }

    if (!fields["item_title"]) {
      formIsValid = false;
      errors["item_title"] = "Cannot be empty";
    }

    if (!fields["item_desc"]) {
      formIsValid = false;
      errors["item_desc"] = "Cannot be empty";
    }

    if (!fields["item_royalties"]) {
      formIsValid = false;
      errors["item_royalties"] = "Cannot be empty";
    }

    this.setState({ errors: errors });
    return formIsValid;
  }

  handleCategory = (e) => {
    let fields = this.state.fields;
    fields['category'] = e.value;
    this.setState({ fields });
  }

  handleChange = (e) => {
    let fields = this.state.fields;
    fields[e.target.name] = e.target.value;
    this.setState({ fields });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { currentUser,isAuthorized } = this.props;
    if (!isAuthorized) {
      NotificationManager.warning("Please sign in.", "Warning", 3000, 
        function (){
          navigate('/home');
      });
      return;
    }
    if (!currentUser || (currentUser && currentUser.role.type === 'public')) {
      NotificationManager.warning("Please contact an manager. You have no permission to create NFT.", "Warning");
      return;
    }
    const { selected_file, fields } = this.state;
    if (this.handleValidation()) {
      this.setState({'loading': true});
      const param = { 
        category: fields.category,
        status: this.state.method,
        deadline: fields.deadline,
        title: fields.item_title, 
        price: fields.item_price,
        description: fields.item_desc,
        priceover: fields.priceover,
        author: currentUser.author ? currentUser.author.id : 1,
        token_type: this.state.token_type,
        preview_image: selected_file,
        situation : "created"
      };
      const { createNfts } = this.props;
      createNfts(param);
      this.setState({'loading': false});
      NotificationManager.success("Successfully create a NFT", "Success");
      navigate("/mint");
    }
  }

  state = {
     isActive: false  
  }

  unlockClick = ()=>{
      this.setState({
          isActive: true      })
  }
  unlockHide = () => {
    this.setState({isActive: false});
  };

render() {
    const { loading } = this.state;
    const { currentUser } = this.props;
    let message = '';
    
    if (!currentUser || (currentUser.role && currentUser.role.type === 'public')) {
      message = `You can't create NFT.<br/>You have no permission to create NFT. Please contact an manager.`;
    }
    return (
      <div>
      <GlobalStyles/>

        <section className='jumbotron breadcumb no-bg' style={{backgroundImage: `url(${'./img/background/subheader.jpg'})`}}>
          <div className='mainbreadcumb'>
            <div className='container'>
              <div className='row m-10-hor'>
                <div className='col-12'>
                  <h1 className='text-center'>Single Create</h1>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='container'>

        <div className="row">
          <div className="col-lg-7 offset-lg-1 mb-5">
              <form id="form-create-item" className="form-border" onSubmit={this.handleSubmit}>
                  {message && (
                    <div className="alert alert-danger" role="alert" dangerouslySetInnerHTML={{__html: message}}></div>
                  )}
                  <div className="field-set">
                      <h5>Upload file</h5>

                      <div className="d-create-file">
                          <p id="file_name">PNG, JPG, GIF, WEBP or MP4. Max 200mb.</p>
                          <div className='browse'>
                            <input type="button" id="get_file" className="btn-main" value="Browse"/>
                            <input id='upload_file' accept="image/*, video/*" type="file" onChange={this.onChange} />
                          </div>
                          
                      </div>

                      <div className="spacer-single"></div>

                      <h5>Select method</h5>
                                    <div className="de_tab tab_methods">
                                        <ul className="de_nav">
                                            <li id='btn1' className="active" onClick={this.handleShow}><span><i className="fa fa-tag"></i>Fixed price</span>
                                            </li>
                                            <li id='btn2' onClick={this.handleShow1}><span><i className="fa fa-hourglass-1"></i>Timed auction</span>
                                            </li>
                                            <li id='btn3' onClick={this.handleShow2}><span><i className="fa fa-users"></i>Open for bids</span>
                                            </li>
                                        </ul>

                                        <div className="de_tab_content pt-3">                                  
                                          <div id="tab_opt_1">
                                                <h5>Price</h5>
                                                <div className="row">
                                                  <div className="col-md-8">
                                                    <input type="number" name="item_price" id="item_price" onChange={this.handleChange} className="form-control mb-2" placeholder="enter price for one item" step="any"/>
                                                    <span style={{ color: "red" }}>{this.state.errors["item_price"]}</span>
                                                  </div>
                                                  <div className="col-md-4">
                                                    <RadioGroup row aria-label="token_type" defaultValue={'BNB'}  name="row-radio-buttons-group" style={{float: 'right'}} value={this.state.token_type} onChange={this.handleTokenType}>
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
                                                    <input type="number" name="priceover" id="priceover" onChange={this.handleChange} className="form-control mb-2" placeholder="enter minimum bid" step="any"/>
                                                    <span style={{ color: "red" }}>{this.state.errors["priceover"]}</span>
                                                  </div>
                                                  <div className="col-md-4">
                                                    <RadioGroup row aria-label="token_type" defaultValue={'BNB'}  name="row-radio-buttons-group" style={{float: 'right'}} value={this.state.token_type} onChange={this.handleTokenType}>
                                                      <FormControlLabel value="BNB" control={<Radio />} label="BNB" />
                                                      <FormControlLabel value="SPC" control={<Radio />} label="SPC" />
                                                    </RadioGroup>
                                                  </div>
                                                </div>
                                                <div className="row pt-1">
                                                    <div className="col-md-6">
                                                        <h5>Starting date</h5>
                                                        <input type="date" name="start_date" id="start_date" onChange={this.handleChange} className="form-control mb-2" min="1997-01-01" />
                                                        <span style={{ color: "red" }}>{this.state.errors["start_date"]}</span>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <h5>Expiration date</h5>
                                                        <input type="date" name="deadline" id="deadline" onChange={this.handleChange} className="form-control mb-2" />
                                                        <span style={{ color: "red" }}>{this.state.errors["deadline"]}</span>
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
                                                    onChange={this.handleCategory}
                                                />
                                                  <span style={{ color: "red" }}>{this.state.errors["category"]}</span>
                                              </div>
                                            </div>

                                        </div>

                                    </div>

                                    <div className="spacer-20"></div>

                                    <div className="switch-with-title">
                                        <h5><i className="fa fa- fa-unlock-alt id-color-2 mr10"></i>Unlock once purchased</h5>
                                        <div className="de-switch">
                                          <input type="checkbox" id="switch-unlock" className="checkbox"/>
                                          {this.state.isActive ?(
                                          <label htmlFor="switch-unlock" onClick={this.unlockHide}></label>
                                          ) : (
                                          <label htmlFor="switch-unlock" onClick={this.unlockClick}></label>
                                          )}
                                        </div>
                                        <div className="clearfix"></div>
                                        <p className="p-info pb-3">Unlock content after successful transaction.</p>

                                        {this.state.isActive ?
                                        <div id="unlockCtn" className="hide-content">
                                            <input type="text" name="item_unlock" id="item_unlock" onChange={this.handleChange} className="form-control mb-2" placeholder="Access key, code to redeem or link to a file..." />             
                                            <span style={{ color: "red" }}>{this.state.errors["item_unlock"]}</span>
                                        </div>
                                        : null }
                                    </div>

                      <h5>Title</h5>
                      <input type="text" name="item_title" id="item_title" onChange={this.handleChange} className="form-control mb-2" placeholder="e.g. 'Crypto Funk" />
                      <span style={{ color: "red" }}>{this.state.errors["item_title"]}</span>

                      <div className="spacer-10"></div>

                      <h5>Description</h5>
                      <textarea data-autoresize name="item_desc" id="item_desc" onChange={this.handleChange} className="form-control mb-2" placeholder="e.g. 'This is very limited item'"></textarea>
                      <span style={{ color: "red" }}>{this.state.errors["item_desc"]}</span>

                      <div className="spacer-10"></div>

                      <h5>Royalties</h5>
                      <input type="number" name="item_royalties" id="item_royalties" onChange={this.handleChange} className="form-control mb-2" placeholder="suggested: 0, 10%, 20%, 30%. Maximum is 70%" step="any"/>
                      <span style={{ color: "red" }}>{this.state.errors["item_royalties"]}</span>

                      <div className="spacer-10"></div>

                      <button type="submit" id="submit" className="btn-main">Create Item</button>
                  </div>
              </form>
          </div>

          <div className="col-lg-3 col-sm-6 col-xs-12">
                  <h5>Preview item</h5>
                  <div className="nft__item m-0">
                      {this.state.method === "on_auction" && this.state.fields.deadline && (
                        <div className="de_countdown">
                          <Clock deadline={this.state.fields.deadline} />
                        </div>
                      )}
                      <div className="author_list_pp">
                          <span>                                    
                              <img className="lazy" src={(currentUser && currentUser.avatar ? api.baseUrl + currentUser.avatar.url : '/img/avatar.jpg')} alt=""/>
                              <i className="fa fa-check"></i>
                          </span>
                      </div>
                      <div className="nft__item_wrap">
                          <span>
                              <img src="./img/items/preview.png" id="get_file_2" className="lazy nft__item_preview" alt=""/>
                          </span>
                      </div>
                      <div className="nft__item_info">
                          <span >
                              <h4>{this.state.fields.item_title}</h4>
                          </span>
                          {this.state.method === 'buy_now' && this.state.fields.item_price && (
                            <div className="nft__item_price">
                              {this.state.fields.item_price} {this.state.token_type}
                            </div>
                          )}
                          {this.state.method === 'on_auction' && this.state.fields.priceover && (
                            <div className="nft__item_price">
                              {this.state.fields.priceover} {this.state.token_type}
                            </div>
                          )}
                      </div> 
                  </div>
              </div>
              {<Backdrop
                  sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                  open={loading}
              >
                  <CircularProgress color="inherit" />
              </Backdrop>}
      </div>

      </section>

        <Footer />
      </div>
   );
  }
}

const mapStateToProps = state => ({
  currentUser: state.authors.currentUser,
  isAuthorized: state.authors.isAuthorizedUser,
});

const mapDispatchToProps = (dispatch) => {

  return {
    createNfts: (params) => {
      dispatch(createSingleNft(params));
    }
  }
 };

export default connect(mapStateToProps, mapDispatchToProps)(Createpage);
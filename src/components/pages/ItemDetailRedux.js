import React, { memo, useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import Clock from "../components/Clock";
import Footer from '../components/footer';
import { createGlobalStyle } from 'styled-components';
import * as selectors from '../../store/selectors';
import { fetchNftDetail } from "../../store/actions/thunks";
/*import Checkout from "../components/Checkout";
import Checkoutbid from "../components/Checkoutbid";*/
import api from "../../core/api";
import moment from "moment";
import { NotificationManager } from 'react-notifications';
import Axios from "axios";
import { navigate } from "@reach/router";
import $ from "jquery";
import {
	getCurrentWallet,
	buyNFT
} from "../../core/nft/interact";

const GlobalStyles = createGlobalStyle`
  header#myHeader.navbar.white {
    background: #fff;
    border-bottom: solid 1px #dddddd;
  }
  .mr40{
    margin-right: 40px;
  }
  .mr15{
    margin-right: 15px;
  }
  .btn2{
    background: #f6f6f6;
    color: #8364E2 !important;
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

const ItemDetailRedux = ({ nftId }) => {

	const curUser = useSelector(selectors.currentUser);
	const [highestPastBidValue, setHighestPastBidValue] = useState(0);
	const [bidJustStarted, setBidJustStarted] = useState(false);
	const [openMenu0, setOpenMenu0] = React.useState(true);
	const [openMenu, setOpenMenu] = React.useState(false);
	const [openMenu1, setOpenMenu1] = React.useState(false);

	const handleBtnClick0 = () => {
		setOpenMenu0(!openMenu0);
		setOpenMenu(false);
		setOpenMenu1(false);
		document.getElementById("Mainbtn0").classList.add("active");
		document.getElementById("Mainbtn").classList.remove("active");
		document.getElementById("Mainbtn1").classList.remove("active");
	};
	const handleBtnClick = () => {
		setOpenMenu(!openMenu);
		setOpenMenu1(false);
		setOpenMenu0(false);
		document.getElementById("Mainbtn").classList.add("active");
		document.getElementById("Mainbtn1").classList.remove("active");
		document.getElementById("Mainbtn0").classList.remove("active");
	};
	const handleBtnClick1 = () => {
		setOpenMenu1(!openMenu1);
		setOpenMenu(false);
		setOpenMenu0(false);
		document.getElementById("Mainbtn1").classList.add("active");
		document.getElementById("Mainbtn").classList.remove("active");
		document.getElementById("Mainbtn0").classList.remove("active");
	};

	const handleBuynowBtnClick = async () => {
		//by web3, read balance of customer and set it to balance variable
		const result = await getCurrentWallet();
		if (result.success) {
			console.log("balanceOfCustomer : ", result);
			setBalanceOfCustomer(result.balance);
			setOpenCheckoutBuynowDlg(true);
		}
	}

	const handlePlaceBidBtnClick = async (nft) => {
		//by web3, read balance of customer and set it to balance variable
		const result = await getCurrentWallet();
		if (result.success) {
			setBalanceOfCustomer(result.balance);
			//get highest bid's value
			var hBidVal = nft.price;
			hBidVal = nft.bids && nft.bids[0] && nft.bids[0].value ? nft.bids[0].value : nft.price;
			if (!nft.bids || !nft.bids[0] || !nft.bids[0].value) setBidJustStarted(true);
			else setBidJustStarted(false);
			setHighestPastBidValue(hBidVal);

			setOpenCheckoutForBidDlg(true);
		}
	}

	const handlerOnCheckoutBuynow = async (nft) => {
		setOpenCheckoutBuynowDlg(false);
		/*check wether customer has enough balance to buy this or not *////
		if (balanceOfCustomer < nft.price) {
			//trigger toast and return
			NotificationManager.warning("You havn't enough balance.", "Warning");
			return;
		}
		else if (nft.author.id === curUser.author.id) {
			NotificationManager.error("Cannot sell by self", "Error");
			return;
		}
		else {
			//?*change the NFT's ownership between customer and author in web3, and transfer NFT's price in web3  *///
			const result = await buyNFT(nft, curUser);
			if (result.success) {
				NotificationManager.success(result.status, "Success");
				navigate("/explore");
			} else {
				NotificationManager.error(result.status, "Error");
			}

			return {
				success: true,
				status:
					"Check out your transaction on Etherscan."
			};
		}
	}

	const handlerOnCheckoutBid = (nft) => {
		setOpenCheckoutForBidDlg(false);
		var biddedPrice = $("#bidPrice").val();
		console.log("biddedPrice : ", biddedPrice, ", highestPastBidValue : ", highestPastBidValue, "bidJustStarted : ", bidJustStarted);
		if (biddedPrice < highestPastBidValue) {
			if (bidJustStarted === true) {
				NotificationManager.warning("Bid with higher or equal price than NFT's price.", "Warning");
				return;
			}
		}
		if (biddedPrice <= highestPastBidValue && bidJustStarted === false) {
			NotificationManager.warning("Bid with higher price than previous one.", "Warning");
			return;
		}
		if (balanceOfCustomer < biddedPrice) {
			//trigger toast and return
			NotificationManager.warning("You have not enough balance.", "Warning");
			return;
		}
		else if (nft.author.id === curUser.author.id) {
			NotificationManager.error("Cannot sell by self", "Error");
			return;
		}
		else {
			//place a bid for the NFT
			var onSaleNft = nft;
			var newBid = { "author": curUser.author.id, "nft": onSaleNft.id, "value": biddedPrice };
			//add a new bid to CMS            
			Axios.post(`${api.baseUrl}${api.bids}`, newBid, {}
			).catch(err => {
				NotificationManager.error("Error is on NFT's bid list.", "Error");
				return;
			});
			NotificationManager.success("You've bid to it.", "Success");
			dispatch(fetchNftDetail(nftId));
			return;
		}
	}

	const handlerManualAcceptAndSell = () => {

	}

	const dispatch = useDispatch();
	const [balanceOfCustomer, setBalanceOfCustomer] = useState(0);
	const nftDetailState = useSelector(selectors.nftDetailState);
	const nft = nftDetailState.data ? nftDetailState.data : [];

	const [openCheckout, setOpenCheckoutBuynowDlg] = React.useState(false);
	const [openCheckoutbid, setOpenCheckoutForBidDlg] = React.useState(false);

	useEffect(() => {
		dispatch(fetchNftDetail(nftId));
	}, [dispatch, nftId]);

	return (
		<div>
			<GlobalStyles />
			<section className='container'>
				<div className='row mt-md-5 pt-md-4'>
					<div className="col-md-6 text-center">
						<img src={nft.preview_image && api.baseUrl + nft.preview_image.url} className="img-fluid img-rounded mb-sm-30" alt="" />
					</div>
					<div className="col-md-6">
						<div className="item_info">
							{nft.status === 'on_auction' &&
								<div>
									<span >Auctions ends in </span>
									<div className="de_countdown ">
										<Clock deadline={nft.deadline} />
									</div>
								</div>
							}
							<h2>{nft.title}</h2>
							<div className="item_info_counts">
								<div className="item_info_type"><i className="fa fa-image"></i>{nft.category}</div>
								<div className="item_info_views"><i className="fa fa-eye"></i>{nft.views}</div>
								<div className="item_info_like"><i className="fa fa-heart"></i>{nft.likes}</div>
							</div>
							<p>{nft.description}</p>

							<div className="d-flex flex-row">
								<div className="mr40">
									<h6>Creator</h6>
									<div className="item_author">
										<div className="author_list_pp">
											<span>
												<img className="lazy" src={(nft.author && nft.author.avatar ? api.baseUrl + nft.author.avatar.url : '/img/avatar.jpg')} alt="" />
												<i className="fa fa-check"></i>
											</span>
										</div>
										<div className="author_list_info">
											<span>{nft.author && nft.author.username}</span>
										</div>
									</div>
								</div>
								<div className="mr40">
									<h6>Collection</h6>
									<div className="item_author">
										<div className="author_list_pp">
											<span>
												<img className="lazy" src={(nft.author && nft.author.avatar ? api.baseUrl + nft.author.avatar.url : '/img/avatar.jpg')} alt="" />
												<i className="fa fa-check"></i>
											</span>
										</div>
										<div className="author_list_info">
											<span>{nft.author && nft.author.username}</span>
										</div>
									</div>
								</div>
							</div>

							<div className="spacer-40"></div>

							<div className="de_tab">

								<ul className="de_nav">
									<li id='Mainbtn0' className="active"><span onClick={handleBtnClick0}>Details</span></li>
									<li id='Mainbtn' ><span onClick={handleBtnClick}>Bids</span></li>
									<li id='Mainbtn1' className=''><span onClick={handleBtnClick1}>History</span></li>
								</ul>

								<div className="de_tab_content">
									{openMenu0 && (
										<div className="tab-1 onStep fadeIn">
											<div className="d-block mb-3">
												<div className="mr40">
													<h6>Owner</h6>
													<div className="item_author">
														<div className="author_list_pp">
															<span>
																<img className="lazy" src={(nft.author && nft.author.avatar ? api.baseUrl + nft.author.avatar.url : '/img/avatar.jpg')} alt="" />
																<i className="fa fa-check"></i>
															</span>
														</div>
														<div className="author_list_info">
															<span>{nft.author && nft.author.username}</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}

									{openMenu && (
										<div className="tab-1 onStep fadeIn">
											{
												nft.bids && nft.bids.map((bid, index) => (
													<div className="p_list" key={index}>
														<div className="p_list_pp">
															<span>
																{
																	bid.author && bid.author.avatar &&
																	<img className="lazy" src={api.baseUrl + bid.author.avatar.url} alt="" />
																}
																<i className="fa fa-check"></i>
															</span>
														</div>
														<div className="p_list_info">
															Bid {bid.author && bid.author.id && bid.author.id === nft.author.id && 'accepted'} <b>{bid.value} {nft.token_type}</b>
															<span>by <b>{(bid.author && bid.author.username) &&
																bid.author.username
															}</b> at {moment(bid.created_at).format('L, LT')}</span>
														</div>
													</div>
												))
											}
										</div>
									)}

									{openMenu1 && (
										<div className="tab-2 onStep fadeIn">
											{nft.history && nft.history.map((bid, index) => (
												<div className="p_list" key={index}>
													<div className="p_list_pp">
														<span>
															{
																bid.author && bid.author.avatar &&
																<img className="lazy" src={api.baseUrl + bid.author.avatar.url} alt="" />
															}
															<i className="fa fa-check"></i>
														</span>
													</div>
													<div className="p_list_info">
														Bid {bid.author && bid.author.id && bid.author.id === nft.author.id && 'accepted'} <b>{bid.value} {nft.token_type}</b>
														<span>by <b>{bid.author && bid.author.username && bid.author.username}</b> at {moment(bid.created_at).format('L, LT')}</span>
													</div>
												</div>
											))}
										</div>
									)}

									{
										curUser.author && curUser.author.id && nft.author && nft.author.id &&
										<div className="d-flex flex-row mt-5">
											{
												(nft.status === "buy_now") && (nft.author.id !== curUser.author.id) &&
												<button className='btn-main lead mb-5 mr15' onClick={() => handleBuynowBtnClick()}>Buy Now</button>
											}
											{
												(nft.status === "on_auction" || nft.status === "has_offers") && (nft.author.id === curUser.author.id) &&
												<button className='btn-main lead mb-5 mr15' onClick={() => handlerManualAcceptAndSell()}>Sell & Finish</button>
											}
											{
												(nft.status === "on_auction" || nft.status === "has_offers") && (nft.author.id !== curUser.author.id) &&
												<button className='btn-main lead mb-5 mr15' onClick={() => handlePlaceBidBtnClick(nft)}>Place Bid</button>
											}
										</div>
									}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
			<Footer />
			{openCheckout &&
				<div className='checkout'>
					<div className='maincheckout'>
						<button className='btn-close' onClick={() => setOpenCheckoutBuynowDlg(false)}>x</button>
						<div className='heading'>
							<h3>Checkout</h3>
						</div>
						<p>You are about to purchase a <span className="bold">{nft.title ? nft.title : ""}</span>
							<span>  from </span><span className="bold">{nft.author && (nft.author.username ? nft.author.username : "")}</span></p>
						<div className='heading mt-3'>
							<p>Your balance</p>
							<div className='subtotal'>
								{balanceOfCustomer}  {nft.token_type}
							</div>
						</div>
						<div className='heading'>
							<p>Service fee {nft.author && nft.author.selling_fee ? `${nft.author.selling_fee}%` : "0%"}</p>
							<div className='subtotal'>
								{nft.author && (nft.author.selling_fee && nft.price) ? `${nft.author.selling_fee * nft.price / 100.0} ${nft.token_type}` : `0 ${nft.token_type}`}
							</div>
						</div>
						<div className='heading'>
							<p>You will pay</p>
							<div className='subtotal'>
								{nft.price ? `${nft.price} ${nft.token_type}` : `0 ${nft.token_type}`}
							</div>
						</div>
						<button className='btn-main lead mb-5' onClick={() => handlerOnCheckoutBuynow(nft)} >Checkout</button>
					</div>
				</div>
			}
			{openCheckoutbid &&
				<div className='checkout'>
					<div className='maincheckout'>
						<button className='btn-close' onClick={() => setOpenCheckoutForBidDlg(false)}>x</button>
						<div className='heading'>
							<h3>Place a Bid</h3>
						</div>
						<p>You are about to purchase a <span className="bold">{nft.title ? nft.title : ""}</span>
							<span> from  </span><span className="bold">{nft.author && (nft.author.username ? nft.author.username : "")}</span></p>
						<div className='detailcheckout mt-4'>
							<div className='listcheckout'>
								<h6>
									Your bid ({nft.token_type})
								</h6>
								<input type="number" id="bidPrice" min={highestPastBidValue} defaultValue={highestPastBidValue} className="form-control" />
							</div>
						</div>
						<div className='heading mt-3'>
							<p>Your balance</p>
							<div className='subtotal'>
								{balanceOfCustomer} {nft.token_type}
							</div>
						</div>
						<div className='heading'>
							<p>Service fee {nft.author && nft.author.selling_fee ? `${nft.author.selling_fee}%` : "0%"}</p>
							<div className='subtotal'>
								{nft.author && (nft.author.selling_fee && nft.price) ? `${nft.author.selling_fee * nft.price / 100.0} ${nft.token_type}` : `0 ${nft.token_type}`}
							</div>
						</div>
						<div className='heading'>
							<p>You will pay</p>
							<div className='subtotal'>
								{nft.price ? `${nft.price} ${nft.token_type}` : `0 ${nft.token_type}`}
							</div>
						</div>
						<button className='btn-main lead mb-5' onClick={() => handlerOnCheckoutBid(nft)} >Checkout</button>
					</div>
				</div>
			}

		</div>
	);
}

export default memo(ItemDetailRedux);
import React, { memo } from 'react';
import styled from "styled-components";
import Clock from "./Clock";
import { navigate } from '@reach/router';
import api from '../../core/api';

const Outer = styled.div`
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 8px;
`;

//react functional component
const NftCard = ({ nft, className = 'd-item col-lg-3 col-md-6 col-sm-6 col-xs-12 mb-4', clockTop = true, height, onImgLoad, authorId=null, status=null, situation=null  }) => {

    const navigateTo = (link) => {
        navigate(link);
    }

    return (
        <div className={className}>
            <div className="nft__item m-0">
            { nft.item_type === 'single_items' ? (
             <div className='icontype'><i className="fa fa-bookmark"></i></div>   
             ) : (  
             <div className='icontype'><i className="fa fa-shopping-basket"></i></div>
                )
            }
                { nft.deadline && clockTop &&
                    <div className="de_countdown">
                        <Clock deadline={nft.deadline} />
                    </div>
                }
                <div className="author_list_pp">
                    <span onClick={()=> navigateTo(`${nft.author_link}/${nft.author.id}`)}>                                    
                        <img className="lazy" src={(nft.author && nft.author.avatar ? api.baseUrl + nft.author.avatar.url : '/img/avatar.jpg')} alt=""/>
                        <i className="fa fa-check"></i>
                    </span>
                </div>
                <div className="nft__item_wrap" style={{height: `${height}px`}}>
                <Outer>
                    <span>
                        <img onLoad={onImgLoad} src={api.baseUrl + (nft.preview_image ? nft.preview_image.url: '')} className="lazy nft__item_preview" alt=""/>
                    </span>
                </Outer>
                </div>
                { nft.deadline && !clockTop &&
                    <div className="de_countdown">
                        <Clock deadline={nft.deadline} />
                    </div>
                }
                <div className="nft__item_info">
                    <span onClick={() => navigateTo(`${nft.nft_link}/${nft.id}`)}>
                        <h4>{nft.title}</h4>
                    </span>
                    { nft.status === 'has_offers' ? (
                            <div className="has_offers">
                                <span className='through'>{nft.priceover}</span> {nft.price} {nft.token_type}
                            </div> 
                        ) : (
                            <div className="nft__item_price">
                                {nft.price} {nft.token_type}
                                { nft.status === 'on_auction' && 
                                    <span>{nft.bid}/{nft.max_bid}</span>
                                }
                            </div>
                        )
                    }
                    <div className="nft__item_action">
                        {
                            authorId === null &&
                            <span onClick={() => navigateTo(`${nft.bid_link}/${nft.id}`)}>{ nft.status === 'on_auction' ? 'Place a bid' : 'Buy Now' }</span>
                        }
                        {
                            authorId && status !=="normal" && situation === "minted" && 
                                <span onClick={() => navigateTo(`${nft.bid_link}/${nft.id}`)}>{ nft.status === 'on_auction' ? 'Place a bid' : 'Buy Now' }</span>                            
                        }
                        {
                            authorId && status ==="normal" && situation === "saled" && 
                                <span onClick={() => navigateTo(`/resell/${nft.id}`)}>Resell</span>                            
                        }
                        {
                            authorId && status !=="normal" && situation === "created" && 
                                <span onClick={() => navigateTo(`/mint`)}>Mint</span>                            
                        }
                    </div>
                    <div className="nft__item_like">
                        <i className="fa fa-heart"></i><span>{nft.likes}</span>
                    </div>                            
                </div> 
            </div>
        </div>             
    );
};

export default memo(NftCard);
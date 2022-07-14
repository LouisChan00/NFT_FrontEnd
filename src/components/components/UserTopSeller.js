import React, { memo } from 'react';
import api from '../../core/api';

//react functional component
const UserTopSeller = ({ user }) => {
    return (
        <>
            <div className="author_list_pp">
              <span onClick={()=> window.open("", "_self")}>
                  <img className="lazy" src={(user && user.avatar ? `${api.baseUrl}${user.avatar.url}` : '/img/avatar.jpg')} alt=""/>
                  <i className="fa fa-check"></i>
              </span>
            </div>                                    
            <div className="author_list_info">
                <span onClick={()=> window.open("", "_self")}>{user.username}</span>
                <span className="bot">{user.author_sale ? user.author_sale.sales : '0'} BNB</span>
            </div>   
        </>     
    );
};

export default memo(UserTopSeller);
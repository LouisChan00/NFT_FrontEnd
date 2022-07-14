import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as selectors from '../../store/selectors';
import * as actions from '../../store/actions/thunks';
import { clearNfts, clearFilter } from '../../store/actions';
import NftCard from './NftCard';
import { shuffleArray } from '../../store/utils';

//react functional component
const ColumnNewRedux = ({ showLoadMore = true, shuffle = false, authorId = null, status=null, situation="minted" }) => {

    const dispatch = useDispatch();
    const nftItems = useSelector(selectors.nftItems);
    const nfts = nftItems ? shuffle ? shuffleArray(nftItems) : nftItems : [];
    const [height, setHeight] = useState(0);

    const onImgLoad = ({ target: img }) => {
        let currentHeight = height;
        if (currentHeight < img.offsetHeight) {
            setHeight(img.offsetHeight);
        }
    }

    useEffect(() => {
        dispatch(actions.fetchNftsBreakdown(authorId, situation, status));
    }, [dispatch, authorId, situation, status]);

    //will run when component unmounted
    useEffect(() => {
        return () => {
            dispatch(clearFilter());
            dispatch(clearNfts());
        }
    }, [dispatch]);

    return (
        <div className='row'>
            {nfts && nfts.map((nft, index) => (
                <NftCard nft={nft} key={index} onImgLoad={onImgLoad} height={height} authorId={authorId} status={status} situation={situation} />
            ))}
        </div>
    );
};

export default memo(ColumnNewRedux);
import { Axios, Canceler } from '../../../core/axios';
import * as actions from '../../actions';
import api from '../../../core/api';
import { approveForResell } from "../../../core/nft/interact";
import path from "path";

export const fetchNftsBreakdown = (authorId, situation, status) => async (dispatch, getState) => {
  
  //access the state
  // const state = getState();
  // console.log(state);

  dispatch(actions.getNftBreakdown.request(Canceler.cancel));

  try {
    let filter = "";
    let addOptions = "";
    if(authorId !== "" && authorId !== undefined && authorId !== null) 
    {
      if(addOptions === "") addOptions = `author=${authorId}`;      
      else addOptions += `&author=${authorId}`;
    }    
    if(situation !== "" && situation !== undefined && situation !== null) 
    {
      if(addOptions === "") addOptions = `situation=${situation}`;
      else addOptions += `&situation=${situation}`;
    }
    if(status !==""  && status !== undefined && status !== null) 
    {
      if(addOptions === "")  addOptions += `status=${status}`;
      else  addOptions += `&status=${status}`;
    }
    if(addOptions !== "") filter += addOptions;

    const { data } = await Axios.get(`${api.baseUrl}${api.nfts}?${filter}`, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.getNftBreakdown.success(data));
  } catch (err) {
    dispatch(actions.getNftBreakdown.failure(err));
  }
};

export const fetchNftShowcase = () => async (dispatch) => {

  dispatch(actions.getNftShowcase.request(Canceler.cancel));

  try {
    const { data } = await Axios.get(`${api.baseUrl}${api.nftShowcases}`, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.getNftShowcase.success(data));
  } catch (err) {
    dispatch(actions.getNftShowcase.failure(err));
  }
};

export const fetchNftDetail = (nftId) => async (dispatch) => {

  dispatch(actions.getNftDetail.request(Canceler.cancel));

  try {
    const { data } = await Axios.get(`${api.baseUrl}${api.nfts}/${nftId}`, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.getNftDetail.success(data));
  } catch (err) {
    dispatch(actions.getNftDetail.failure(err));
  }
};

export const reselllingNFTAction = (formData, nftId) => async(dispatch) =>{
  
  dispatch(actions.resellingNft.request(Canceler.cancel));

  try {
    const { data } = await Axios.put(`${api.baseUrl}${api.nfts}/${nftId}`, formData, {
      cancelToken: Canceler.token,
      params: {},
    });
    await approveForResell();
    dispatch(actions.resellingNft.success(data));
  } catch (err) {
    dispatch(actions.resellingNft.failure(err));
  }
}

export const createSingleNft = (formData) => async (dispatch) => {

  var formImageData = new FormData();
  formImageData.append('files', formData.preview_image, formData.preview_image.name)
  console.log(formImageData);
  await Axios.post(`${api.baseUrl}/upload`, formImageData,
    {          
    enctype: 'multipart/form-data',
    headers: {
      "Content-Type" : formData.preview_image.type,
      "Authorization": "Bearer "+localStorage.getItem("jwtToken") , // <- Don't forget Authorization header if you are using it.
    },
  }).then((response) => {
    formData.preview_image = response.data[0].id;
  }).catch(function (err) {
    console.log("error:", err);
  });

  dispatch(actions.postNftFile.request(Canceler.cancel));

  try {
    const { data } = await Axios.post(`${api.baseUrl}${api.nfts}`, formData, {
      cancelToken: Canceler.token,
      params: {},
    });

    dispatch(actions.postNftFile.success(data));
  } catch (err) {
    dispatch(actions.postNftFile.failure(err));
  }
};

export const createMultipleNft = (formData, files) => async (dispatch) => {
  try {
    var namingIndex = 1;

    for(let index in files) {
      let param = {
        ...formData,
        preview_image: files[index]
      }
      
      var ext = path.extname(param.preview_image.name);
      var sequentialName =  param.title + " #" + namingIndex + ext;
      var formImageData = new FormData();
      formImageData.append('files', param.preview_image, sequentialName)
      console.log(formImageData);
      await Axios.post(`${api.baseUrl}/upload`, formImageData,
        {          
        enctype: 'multipart/form-data',
        headers: {
          "Content-Type" : param.preview_image.type,
          "Authorization": "Bearer "+localStorage.getItem("jwtToken") , // <- Don't forget Authorization header if you are using it.
        },
      }).then((response) => {
        param.preview_image = response.data[0].id;
      }).catch(function (err) {
        console.log("error:", err);
      });

      param.title = param.title + " #"+namingIndex;
      await Axios.post(`${api.baseUrl}${api.nfts}`, param, {
        cancelToken: Canceler.token,
        params: {},
      });
      namingIndex ++;
    }
  } catch (err) {
    console.log(err);
  }
};

export const mintedNft = async (nftId, tokenURI) => {
  try {
    const { data } = await Axios.put(`${api.baseUrl}${api.nfts}/${nftId}`,
    {"unique_id": tokenURI, "situation" : "minted"},{
      cancelToken: Canceler.token,
      params: {},
    });
    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  } 
};
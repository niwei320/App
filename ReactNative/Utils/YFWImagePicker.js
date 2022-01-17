import React, {Component} from 'react';
import {
    View,
    Platform,
} from 'react-native'
import ImagePicker from 'react-native-image-picker'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import YFWNativeManager from './YFWNativeManager';
import YFWToast from "./YFWToast";
import {isAndroid} from "../PublicModule/Util/YFWPublicFunction";

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


var photoCameraOptions = {

    title:'请选择',
    cancelButtonTitle:'取消',
    takePhotoButtonTitle:'拍照',
    chooseFromLibraryButtonTitle:'手机相册',
    quality:0.8,
    maxWidth: 600,
    maxHeight: 600,
    allowsEditing:false,
    noData:true,
    storageOptions:{
        skipBackup:true,
        path:'images'
    },
    mediaType: 'photo',
}


export default class YFWImagePicker {

    constructor() {
        this.isShowImagePicker = false
    }

    setOption(option){

        this.option = option;

    }

    setAllowsEditing(allow){
        photoCameraOptions.allowsEditing = allow
    }

    setQuality(quality) {
        if (!quality || isNaN(parseFloat(quality))) {
            return
        }
        quality = parseFloat(quality)
        if (quality > 1) {
            quality = 1
        } else if (quality <= 0) {
            quality = 0.1
        }
        photoCameraOptions.quality = quality
    }

    setMaxSize(maxSize) {
        if (!maxSize || !maxSize.width || !maxSize.height || isNaN(parseFloat(maxSize.height)) || isNaN(parseFloat(maxSize.width))) {
            return
        }
        let maxHeight = parseFloat(maxSize.height)
        if (maxHeight <= 0) {
            maxHeight = 100
        }
        let maxWidth = parseFloat(maxSize.width)
        if (maxWidth <= 0) {
            maxWidth = 100
        }
        photoCameraOptions.maxHeight = maxHeight
        photoCameraOptions.maxWidth = maxWidth
    }

    returnValue(block){

        this.block = block;

    }

    show(){

        if(this.isShowImagePicker){
            return
        }
        YFWNativeManager.checkCameraAuthorizationStatusCallback((status)=>{
            if (status) {
                let option = photoCameraOptions;
                this.isShowImagePicker = true
                // YFWToast('图片压缩质量'+option.quality)
                // setTimeout(() => {
                //     YFWToast('图片压缩宽高'+option.maxWidth+'x'+option.maxHeight)
                // }, 2000);
                ImagePicker.showImagePicker(option,(response)=>{
                    this.isShowImagePicker = false
                    if(isAndroid() && response.type && response.type.includes('video')){
                        YFWToast('请选择图片')
                    } else {
                        if (this.block){
                            this.block(response.uri);
                        }
                    }
                });
            }
        })



    }



}
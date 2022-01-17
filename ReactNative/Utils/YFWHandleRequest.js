import React, {Component} from 'react';
import {
    View,
} from 'react-native'
import {isNotEmpty} from "../PublicModule/Util/YFWPublicFunction";
import YFWUserInfoManager from "./YFWUserInfoManager";

const filterImage = [".JPEG",".jpeg",".JPG",".jpg",".png",".gif",".webp",".svg"]

export default class YFWHandleRequest {


    static handleResponse(res){

        let handleRes = new YFWHandleRequest();

        try {

            let type = Object.prototype.toString.call(res);

            if (type === '[object Object]') {
                res = handleRes.convertObj(res);
            } else if (type === '[object Array]'){
                res = handleRes.convertArray(res);
            } else if (type === '[object String]'){
                res = handleRes.convertImg(res);
            }

        } catch (e) {

        } finally {
            return res
        }

    }


    convertObj(object){

        try {

            for (let key of Object.keys(object)) {

                let value = object[key];
                let type = Object.prototype.toString.call(value);

                if (type === '[object Object]'){
                    object[key] = this.convertObj(value);
                } else if(type === '[object Array]'){
                    object[key] = this.convertArray(value);
                } else if(type === '[object String]'){
                    object[key] = this.convertImg(value);
                }

            }

        } catch (e) {

        } finally {
            return object;
        }

    }


    convertArray(array){

        try {

            for (let i = 0 ; i < array.length ; i++){

                let object = array[i];
                let type = Object.prototype.toString.call(object);

                if (type === '[object Object]'){
                    array[i] = this.convertObj(object);
                } else if(type === '[object Array]'){
                    array[i] = this.convertArray(object);
                } else if(type === '[object String]'){
                    array[i] = this.convertImg(object);
                }

            }

        } catch (e) {

        } finally {
            return array;
        }

    }


    convertImg(img){

        let isImage = this.contantImage(img);

        if (isImage && img.includes('default')){

            img = this.imgHander(img);
            return img;
        }

        if (isNotEmpty(img) && isImage) {

            if (img.includes('yaofangwang')){

                // img = img.replace('https','http');

            } else if(img.startsWith('file://')){

                img = img.replace('file://','');
                img = this.imgHander(img);

            } else {

                img = this.imgHander(img);
            }
        }

        return img

    }


    imgHander(img){

        if (img.includes('yaofangwang')){

            return img;
        }

        let cdn = YFWUserInfoManager.ShareInstance().getCdnUrl();

        if (img.startsWith('/')) {
            img = 'https:' + cdn + img;
        } else if (img.startsWith('http://192.168')||img.startsWith('https://192.168')) {
            img = img.replace('https','http')
            return img
        } else if (img.startsWith('http')){
            return img;
        } else {
            img = 'https:' + cdn + '/' + img;
        }

        return img;
    }


    contantImage(string){

        return filterImage.some(function(value){return string.includes(value)});

    }







}
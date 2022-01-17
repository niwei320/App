import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, DeviceEventEmitter,ImageBackground
} from 'react-native';
import YFWImagePicker from "../../Utils/YFWImagePicker";
import {isEmpty, isNotEmpty, kScreenWidth, safe} from "../../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "../../Utils/YFWNativeManager";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWToast from "../../Utils/YFWToast";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
let layoutWidth = kScreenWidth - 26 - 20
export default class YFWPrescriptionUploadPhotoView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            imageUri: this.props.imageUri,
            imageDate:[],
            size: this.props.size,
        };
    }


    // ======= Action =======
    _selectPic(index) {
        if (this.props.clickPic) {
            let canGoBack = this.props.clickPic(index)
            if (canGoBack) {
                return
            }
        }
        this._uploadImage(index)
    }

    _uploadImage(index) {
        if(!this.imagePicker){
            this.imagePicker = new YFWImagePicker();
        }
        this.imagePicker.returnValue((uri)=> {
            if (isNotEmpty(uri)) {
                DeviceEventEmitter.emit('LoadProgressShow')
                YFWNativeManager.tcpUploadImg(uri,(url)=>{
                    this.state.imageUri[index] = url
                    this.props.returnImage(this.state.imageUri);
                    DeviceEventEmitter.emit('LoadProgressClose');
                },(msg)=>{
                    YFWToast(msg)
                    DeviceEventEmitter.emit('LoadProgressClose');
                },-1)
            }
        });
        this.imagePicker.show();
    }

    _reloadPic() {
        this.setState({
            imageUri: this.props.imageUri,
        })
    }

    // ====== View =======
    render() {
        let items = []
        if (isNotEmpty(this.state.imageUri)) {
            this.state.imageUri.forEach((item, index) => {
                items.push(this.renderItem(item, index))
            })
            if (this.state.imageUri.length < this.state.size ) {
                items.push(this.renderItem('', this.state.imageUri.length))
            }
        } else {
            items.push(this.renderItem('', 0))
        }
        return (
            <View style = {{flexDirection: 'row', flexWrap: 'wrap',paddingHorizontal: 10}}>
                {items}
            </View>
        )
    }


    renderItem(item, index) {

        let cdn = YFWUserInfoManager.ShareInstance().getCdnUrl();
        if (isNotEmpty(item)) {

            return (
                <TouchableOpacity activeOpacity = {1} onPress = {() => this._selectPic(index)}
                                  style = {styles.imageTouch}>
                    <View style = {{width: layoutWidth/3-10, height: layoutWidth/3-10}}>
                        <Image style = {styles.image}
                               source = {{uri: 'http:' + cdn + '/' + this.state.imageUri[index]}} />
                        <TouchableOpacity activeOpacity = {1}
                                          onPress = {() => this.clearImage(index)}
                                          hitSlop = {{top: 10, left: 10, bottom: 10, right: 10}}
                                          style = {styles.imageClearTouch}>
                            <Image style = {{width: 17, height: 17}}
                                   source = {require('../../../img/photo_Close.png')}></Image>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )

        } else {
            let upTitle = isNotEmpty(this.props.upTitle)?this.props.upTitle:'上传图片'
            return (
                <TouchableOpacity activeOpacity = {1} onPress = {() => this._selectPic(index)}
                                  style = {styles.imageTouch}>
                    <ImageBackground style = {styles.image}
                        source = {require('../../../img/up_photo.png')} >
                        <Text style={{position:'absolute',bottom:10,left:0,right:0,height:13,textAlign:'center',fontSize:11,color:'#999',fontWeight:'500'}}>{upTitle}</Text>
                    </ImageBackground>
                </TouchableOpacity>
            );

        }

    }

    clearImage(index) {
        this.state.imageUri.splice(index,1)
        this.setState({
            imageUri: this.state.imageUri
        })
        this.props.returnImage(this.state.imageUri);
    }



}

const styles = StyleSheet.create({
    image: {
        width: layoutWidth/3-10, height: layoutWidth/3-10, resizeMode: "cover"
    },
    imageTouch: {
        width: layoutWidth/3,
        height: layoutWidth/3+26,
        paddingHorizontal:5,
        backgroundColor: 'white',
        paddingTop: 10,
        paddingBottom: 26
    },
    imageClearTouch: {
        position: 'absolute',
        top: 1,
        right: 1,
        width: 17,
        height: 17
    }
});
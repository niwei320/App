import React from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    DeviceEventEmitter,
    Platform
} from 'react-native'

import {isNotEmpty,kScreenWidth} from '../../../../PublicModule/Util/YFWPublicFunction'
import {BaseStyles} from '../../../../Utils/YFWBaseCssStyle'
import YFWImagePicker from "../../../../Utils/YFWImagePicker"
import YFWNativeManager from '../../../../Utils/YFWNativeManager'
import YFWTitleView from '../../../../PublicModule/Widge/YFWTitleView';
import {orangeColor} from '../../../../Utils/YFWColor'
const DEFAULT = 'default'
let imagWidth = (kScreenWidth-106)/3
export default class YFWWDUpLoadInspectionReport extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            imageUris: [DEFAULT],
            tcpImageUrl: [],
        }
    }


    _renderImageChooseView() {
        if (isNotEmpty(this.state.imageUris)) {
            return this.state.imageUris.map((item, index) => this._renderImagesItem(item, index));
        } else {
            return <View/>
        }
    }

    getUserChoosePicStatus_tcp() {
        /*
         *  比对保存服务器返回的链接的数组 和保存本地图片的数组的长度
         * */
        this.removeElement(DEFAULT)
        let localPicDataArrayLength = this.state.imageUris.length;
        let tcpImageUrlDataArrayLength = this.state.tcpImageUrl.length;
        if (localPicDataArrayLength > tcpImageUrlDataArrayLength) {
            this.state.imageUris.push(DEFAULT);
            return true
        }
        this.state.imageUris.push(DEFAULT);
        return false
    }


    getImageDataArray_tcp() {
        if (this.state.tcpImageUrl.length == 0) {
            return null;
        }
        return this.state.tcpImageUrl;
    }

    /*
     *  图片上传失败 重新上传
     * */
    getUpLoadReportPicAgain_tcp() {
        this.removeElement(DEFAULT);
        this.state.tcpImageUrl = [];
        for (let i = 0; i < this.state.imageUris.length; i++) {
            this._uploadImage(this.state.imageUris[i], 'again')
        }
        if(this.state.imageUris.length<3){
            this.state.imageUris.push(DEFAULT)
        }
    }

    /**
     * 选择图片
     * @param item
     * @private
     */
    _selectPic(item) {
        if (item != DEFAULT) {
            return
        }
        if(!this.imagePicker){
            this.imagePicker = new YFWImagePicker();
        }
        this.imagePicker.setMaxSize({width:1280,height:1280})
        if (Platform.OS == 'ios') {
            this.imagePicker.setQuality(1)
        }
        this.imagePicker.returnValue((result)=> {
            if (isNotEmpty(result)) {
                this._uploadImage(result)
                this.addPic(result)
            }

        });
        this.imagePicker.show();
    }

    /**
     * 添加图片
     * @param item
     */
    addPic(item) {
        this.removeElement(DEFAULT)
        let array = this.state.imageUris
        array.push(item)
        if (array.length < 3) {
            array.push(DEFAULT)
        }
        this.setState({
            imageUris: array
        });
    }

    /*
     *  上传图片
     * */

    _uploadImage(url, type) {
        if (type != 'again') {
            DeviceEventEmitter.emit('LoadProgressShow')
        }
        YFWNativeManager.tcpUploadImg(url, (imgUrl)=> {
            if (type != 'again') {
                DeviceEventEmitter.emit('LoadProgressClose');
            }
            this.state.tcpImageUrl.push(imgUrl);
        }, (error)=> {
            if (type != 'again') {
                DeviceEventEmitter.emit('LoadProgressClose');
            }
        })
    }

    /**
     * 删除图片
     * @param item
     */
    removePic(item) {
        this.removeElement(DEFAULT)
        this.removeElement(item)
        let array = this.state.imageUris
        array.push(DEFAULT)
        this.setState({
            imageUris: array
        });
    }

    /**
     * 删除元素
     * @param item
     */
    removeElement(item) {
        let index = this.state.imageUris.indexOf(item)
        if (index != -1) {
            this.state.imageUris.splice(index, 1)
            this.state.tcpImageUrl.splice(index, 1)
        }
    }

    _renderImageItemByNetType(item) {
        return (<Image style={{width: imagWidth, height: imagWidth, resizeMode: "contain"}}
                       source={{uri:item}}/>)

    }

    _renderImagesItem(item, index) {
        if (item != DEFAULT) {
            return (
                <View
                    style={[BaseStyles.centerItem,{width:imagWidth,height:imagWidth,flexDirection:'row',marginLeft:index == 0?0:20}]}
                    key={index}>
                    <TouchableOpacity onPress={()=> this._selectPic(item)} activeOpacity={1}>
                        {this._renderImageItemByNetType(item)}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=> this.removePic(item)} style={{position:'absolute',right:-8,top:-8}}
                                      activeOpacity={1}>
                        <Image style={{width: 15, height: 15, resizeMode: "cover"}}
                               source={require('../../../../../img/ic_pic_del.png')}/>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View
                    style={[BaseStyles.centerItem,{marginLeft:this.state.imageUris.length == 1? 0:20}]}
                    key={index}>
                    <TouchableOpacity onPress={()=> this._selectPic(item)} activeOpacity={1}>
                        <Image style={{width: imagWidth, height: imagWidth, resizeMode: "cover"}}
                                source={require('../../../../../img/upload_photo3.png')}/>
                    </TouchableOpacity>
                </View>
            );
        }
    }


    render() {
        if (this.props.is_upload_report == 'true') {
            return (
                <View >
                    <YFWTitleView title={'上传检验报告'} style_title={{fontSize:13,color:'#333333',width:110}} hiddenBgImage={true}/>
                    <Text style={{fontSize:12,color:orangeColor(),marginTop:-4}}>{this.props.tips}</Text>
                    <View style={{flexDirection:'row', flexWrap:'wrap',marginTop:17,marginBottom:20}}>
                        {this._renderImageChooseView()}
                    </View>
                </View>
            )
        } else {
            return <View/>
        }

    }
}

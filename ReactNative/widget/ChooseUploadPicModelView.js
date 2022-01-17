import React from 'react'
import {
    View,
    Modal,
    Dimensions,
    TouchableOpacity,
    Text, Platform, DeviceEventEmitter
} from 'react-native'

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
import {pushNavigation} from '../Utils/YFWJumpRouting'
import YFWNativeManager from '../Utils/YFWNativeManager'
import ImagePicker from 'react-native-image-picker'
import YFWToast from "../Utils/YFWToast";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import ModalView from "../widget/ModalView";
import LoadProgress from "../widget/LoadProgress";
import {safe} from "../PublicModule/Util/YFWPublicFunction";


export default class ChooseUploadPicModelView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            items: ['药品库导入', '拍照', '相册选择', '取消'],
            textColorLight: '#333333',
            textColorNomal: '#999999',
            imgUri: '',
            imageUriArray: []
        }
    }

    renderAlertView() {
        return (<View style={{height:height,width:width,backgroundColor:'rgba(0, 0, 0, 0.3)'}}>
            <TouchableOpacity style={{width:width,height:height-260}} onPress={()=>this.close()}>
            </TouchableOpacity>
            <View style={{backgroundColor:'#FFF',width:width,height:260}}>
                {this._renderItem()}
            </View>
        </View>)
    }

    _renderItem() {
        return this.state.items.map((item, index)=>this._renderItemDetail(item, index))
    }

    _renderItemDetail(item, index) {
        return ( <TouchableOpacity style={{width:width,alignItems:'center',height:60}}
                                   onPress={()=>this._chooseToAddPic(index)}>
                <View style={{flex:1}}/>
                <Text
                    style={{fontSize:16,color:index <=2 ? this.state.textColorLight:this.state.textColorNomal}}>{item}</Text>
                <View style={{flex:1}}/>
                {this._renderSpliteView(index)}
            </TouchableOpacity>
        )
    }

    _renderSpliteView(index) {
        if (index <= 2) {
            return (<View style={{width:width,height:1,backgroundColor:'#E5E5E5'}}></View>)
        } else {
            return null
        }
    }

    //action
    show() {
        this.modalView && this.modalView.show()
    }

    close() {
        this.modalView && this.modalView.disMiss()
    }

    render() {
        return (
            <View>
                <ModalView ref={(c) => this.modalView = c} animationType="fade">
                    {this.renderAlertView()}
                </ModalView>
            </View>
        )
    }

    _chooseToAddPic(index) {
        this.close();
        switch (index) {
            case 0:
                YFWNativeManager.mobClick('account-drug reminding-info-add from drug store');
                this._choosePicFromDrugStorage();
                break;
            case 1:
                YFWNativeManager.mobClick('drag notification-add-upload-photo')
                this._choosePicFromCamera();
                break;
            case 2:
                YFWNativeManager.mobClick('drag notification-add-upload-album')
                this._choosePicFromPhotoAlbum();
                break;
        }
    }

    _choosePicFromDrugStorage() {
        let {navigate}  = this.props.navigation;
        pushNavigation(navigate, {
            type: 'choose_medicine_fromdrugstorage',
            callback: (data)=>this.props.chooseMedicineCallbacl(data)
        })
    }

    _choosePicFromCamera() {
        ImagePicker.launchCamera({
            quality:0.8,
            maxWidth: 600,
            maxHeight: 600,
            allowsEditing:true,
            noData:false,
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        }, (response) => {
            if (response.didCancel) {
            } else if (response.error) {
            } else if (response.customButton) {
            } else {
                DeviceEventEmitter.emit('LoadProgressShow');
                this.props.chooseMedicineCallbacl(response)
                this.state.imageUriArray = [];
                if (Platform.OS == 'android') {
                    this.state.imageUriArray.push(response.path)
                    this._updataUserPic(response.path);
                } else {
                    this.state.imageUriArray.push(response.uri)
                    this._updataUserPic(response.uri);
                }
            }
        });
    }

    _choosePicFromPhotoAlbum() {
        ImagePicker.launchImageLibrary({
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        }, (response) => {
            if (response.didCancel) {
            } else if (response.error) {
            } else if (response.customButton) {
            } else {
                DeviceEventEmitter.emit('LoadProgressShow');
                this.props.chooseMedicineCallbacl(response)
                this.state.imageUriArray = [];
                if (Platform.OS == 'android') {
                    this.state.imageUriArray.push(response.path)
                    this._updataUserPic(response.path);
                } else {
                    this.state.imageUriArray.push(response.uri)
                    this._updataUserPic(response.uri);
                }
            }
        });
    }

    _updataUserPic(uri) {
        YFWNativeManager.tcpUploadImg(uri, (res) => {
            DeviceEventEmitter.emit('LoadProgressClose');
            let data = {img_url: safe(res), uri: uri};
            this.props.chooseMedicineCallbacl(data)
            // YFWToast('图片上传成功');
        }, (error) => {
            DeviceEventEmitter.emit('LoadProgressClose');
            YFWToast('图片上传失败');
        });
    }
}

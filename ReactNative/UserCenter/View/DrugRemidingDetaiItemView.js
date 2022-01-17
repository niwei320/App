import React from 'react'
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    TextInput,
    Dimensions,
    ImageBackground,
    Platform
} from 'react-native'
const width = Dimensions.get('window').width;
import {imageJoinURL, isNotEmpty, strMapToObj, tcpImage} from '../../PublicModule/Util/YFWPublicFunction'
import Picker from 'react-native-picker';
import ChooseUploadPicModelView from '../../widget/ChooseUploadPicModelView'
import YFWNativeManager from '../../Utils/YFWNativeManager'
import {darkTextColor} from '../../Utils/YFWColor'
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";

export default class DrugRemidingDetaiItemView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            id:0,
            medicineName: '',
            usage_fee: '',
            unit: '',
            imageUrl: require('../../../img/add_drug.png')
        }
    }

    componentDidMount() {
        if (isNotEmpty(this.props.data.image_url)) {
            this.state.imageUrl = {uri:this.props.data.image_url}
        }

        this.setState({
            id:this.props.data.id,
            medicineName: this.props.data.name_cn,
            usage_fee: this.props.data.usage_fee,
            unit: this.props.data.unit,
            itemBg: '#16c08e',
        })
    }

    onInputTextChange(text, index) {
        switch (index) {
            case 1:
                YFWNativeManager.mobClick('account-drug reminding-info-name');
                this.setState({
                    medicineName: text
                })
                break;
            case 2:
                YFWNativeManager.mobClick('account-drug reminding-info-level');
                this.setState({
                    usage_fee: text.replace(/[^0-9]/ig,'')
                })
                break;
            case 3:
                YFWNativeManager.mobClick('account-drug reminding-info-unit');
                this.setState({
                    unit: text
                })
                break
        }
        let infoMap = {
            id:this.state.id,
            goods_id: this.props.data.goods_id,
            image: this.state.imageUrl.uri,
            name_cn: index==1?text:this.props.data.name_cn,
            usage_fee: index==2?text:this.props.data.usage_fee,
            unit: index==3?text:this.props.data.unit,
            image_url:this.state.imageUrl.uri,
        };


        if (this.props.callback) {
            this.props.callback(infoMap,this.props.index);
        }

    }

    _addMecidinePic() {
        YFWNativeManager.mobClick('drag notification-add-upload')
        this.refs.choose_pic_type.show();
    }

    render() {

        let image_url = isNotEmpty(this.props.data.image_url)?this.props.data.image_url:'';
        if (image_url.includes('medicine') && !image_url.includes('300x300')){
            image_url = tcpImage(image_url);
        }
        if(isNotEmpty(image_url)&&!image_url.startsWith('http')){
            let cdn = YFWUserInfoManager.ShareInstance().getCdnUrl();
            if(image_url.startsWith('/')){
                image_url = 'http:'+cdn+image_url.trim()
            }else {
                image_url =  'http:'+cdn+'/'+image_url.trim()
            }
        }

        let image_load = require('../../../img/add_drug.png');
        if (image_url.length > 0){
            image_url = imageJoinURL(image_url);
            image_load = {uri:image_url}
        }

        return (
            <View style={{backgroundColor:this.state.itemBg,shadowColor:darkTextColor(),shadowOpacity:0.3,shadowRadius:3,shadowOffset:{width: 0, height: -2}}}>
                <View style={{flexDirection:'row',width:width,paddingLeft:10,paddingTop:10,alignItems:'center',paddingBottom:10}}>
                    <TouchableOpacity style={{width:70,height:70}} onPress={()=>this._addMecidinePic()}>
                        <ImageBackground style={{width:70,height:70}} source={require('../../../img/add_drug.png')}>
                            <Image style={{width:70,height:70,resizeMode:'stretch'}}
                                   source={image_load}>
                            </Image>
                        </ImageBackground>
                    </TouchableOpacity>
                    <View>
                        <View style={{flexDirection:'row',height:40,alignItems:'center',marginRight:10}}>
                            <Text style={{marginLeft:10,fontSize:14,color:'#FFF'}}>药品名称</Text>
                            <View style={{width:width-156}}>
                                <TextInput style={{marginLeft:5,color:'#FFF',fontSize:14,padding:0}}
                                           onFocus={()=>this.onFocus()}
                                           value={this.state.medicineName}
                                           onChangeText={(text) => this.onInputTextChange(text,1)}
                                           underlineColorAndroid='transparent'/>
                                <View style={{marginLeft:5,marginTop:5,backgroundColor:'#FFF',height:1}}/>
                            </View>
                        </View>
                        <View style={{flexDirection:'row',flex:1,height:40,alignItems:'center',marginTop:5}}>
                            <Text style={{marginLeft:10,fontSize:14,color:'#FFF'}}>药品用量</Text>
                            <View>
                                <TextInput maxLength={5} style={{width:100,textAlign:'center',marginLeft:5,color:'#FFF',fontSize:14,padding:0}}
                                           keyboardType='numeric' value={this.state.usage_fee}
                                           onChangeText={(text) => this.onInputTextChange(text,2)}
                                           onFocus={()=>this.onFocus()}
                                           underlineColorAndroid='transparent'/>
                                <View style={{width:100,marginLeft:5,marginTop:5,backgroundColor:'#FFF',height:1}}/>
                            </View>
                            <Text style={{fontSize:14,color:'#FFF',marginLeft:10}}>单位</Text>
                            <View style={{flex:1,marginRight:10}}>
                                {this._renderStandard()}
                            </View>
                        </View>
                    </View>
                </View>
                <ChooseUploadPicModelView ref='choose_pic_type' navigation = {this.props.navigation} chooseMedicineCallbacl = {(data)=>this.chooseMedicineCallbacl(data)}/>
            </View>
        )
    }

    onFocus(){
        Picker.hide()
    }

    chooseMedicineCallbacl(data){
        if (YFWUserInfoManager.defaultProps.isRequestTCP) {
            let infoMap = new Map();
            if (data.title){
                this.setState({
                    medicineName: data.title,
                    imageUrl: {uri:imageJoinURL(tcpImage(data.img_url))},
                })
                infoMap.set('image',imageJoinURL(tcpImage(data.img_url)));
                infoMap.set('name_cn',data.title);
            } else {
                this.setState({
                    imageUrl: {uri:imageJoinURL(data.img_url)},
                })
                infoMap.set('image',imageJoinURL(data.img_url));
                infoMap.set('name_cn',this.state.medicineName);
            }
            infoMap.set('image_url',imageJoinURL(tcpImage(data.img_url)));
            infoMap.set('goods_id',data.goods_id);
            infoMap.set('unit',this.state.unit);
            infoMap.set('usage_fee',this.state.usage_fee);
            infoMap.set('id',this.state.id);
            if (this.props.callback) {
                this.props.callback(strMapToObj(infoMap),this.props.index);
            }
        }else{
            let infoMap = new Map();
            if (data.title){
                this.setState({
                    medicineName: data.title,
                    imageUrl: {uri:data.img_url},
                })
                infoMap.set('image_url',data.img_url);
                infoMap.set('name_cn',data.title);
            }else if(data.uri){
                this.setState({
                    imageUrl: {uri:data.uri},
                })
                return;
            } else {
                this.setState({
                    imageUrl: {uri:data},
                })
                infoMap.set('image_url',data);
                infoMap.set('name_cn',this.state.medicineName);
            }
            // infoMap.set('image_url',data.img_url);
            infoMap.set('goods_id',data.goods_id);
            infoMap.set('type',this.props.data.type);
            infoMap.set('unit',this.state.unit);
            infoMap.set('usage_fee',this.state.usage_fee);
            infoMap.set('value',this.props.data.value);
            infoMap.set('id',this.props.data.id);
            if (this.props.callback) {
                this.props.callback(strMapToObj(infoMap),this.props.index);
            }
        }
    }

    _chooseMedicienUnity() {
        let pickerData = ['组', 'mg', 'ml', 'l', '片', '粒', '丸', '袋', '滴', '喷', '揿', 'ug', '瓶', '其他'];
        Picker.init({
            pickerData,
            pickerFontColor: [51,51,51,1],
            pickerConfirmBtnText:'确定',
            pickerConfirmBtnColor:[39,191,143,1],
            pickerCancelBtnText:'取消',
            pickerCancelBtnColor:[102,102,102,1],
            pickerTitleText:'',
            wheelFlex: [1],
            onPickerConfirm: pickedValue => {
                this.setState({
                    unit: pickedValue[0]
                })
                this.onInputTextChange(pickedValue[0],3);
            },
            onPickerCancel: pickedValue => {
                if (this.state.action == 'updata') {
                    this.state.drugTimes.splice(this.state.updataDrugItemsIndex, 1);
                    this.setState({canAddDrugTime: true})
                }
            },
        });
        Picker.show();
    }

    _renderStandard() {
        if (Platform.OS == 'ios') {
            return (<View>
                <TextInput style={{textAlign:'center',color:"#FFF",fontSize:14,width:width-304}}
                           value={this.state.unit}
                           onChangeText={(text) => this.onInputTextChange(text,3)}
                           underlineColorAndroid='transparent'
                           editable={false}
                           allowFontScaling={false}/>
                <View style={{marginLeft:5,marginTop:5,backgroundColor:'#FFF',height:1,width:width-304}}/>
                <TouchableOpacity onPress={()=>this._chooseMedicienUnity()}>
                    <View style={{position:'absolute',top:-40,left:0,width:100,height:40}}/>
                </TouchableOpacity>
            </View>)
        } else {
            return (<View>
                <TouchableOpacity onPress={()=>this._chooseMedicienUnity()}>
                <TextInput style={{textAlign:'center',color:"#FFF",fontSize:14,padding:0,width:width-304}}
                           value={this.state.unit}
                           onChangeText={(text) => this.onInputTextChange(text,3)}
                           underlineColorAndroid='transparent'
                           editable={false}
                           allowFontScaling={false}/>
                <View style={{marginLeft:5,marginTop:5,backgroundColor:'#FFF',height:1,width:width-304}}/>
                </TouchableOpacity>
            </View>)
        }
    }
}

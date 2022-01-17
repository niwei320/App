import React from 'react'
import {
    View,
    Dimensions,
    Platform,
    TouchableOpacity,
    Image,
    Text,
    TextInput,
    NativeModules
} from 'react-native'

import {isEmpty} from '../../PublicModule/Util/YFWPublicFunction'
import YFWToast from '../../Utils/YFWToast'
import YFWNativeManager from "../../Utils/YFWNativeManager";
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import { EMOJIS } from '../../PublicModule/Util/RuleString';
const width = Dimensions.get('window').width;
const {StatusBarManager} = NativeModules;
export default class ChooseMedicineDrugStorageHead extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            marginTop: undefined,
            medicienName: undefined
        }
    }

    render() {
        let headerH = (Platform.OS === 'ios') ? 116 : Platform.Version > 19?StatusBarManager.HEIGHT+100:100;
        this.state.marginTop = (Platform.OS === 'ios') ? 24 : Platform.Version > 19?StatusBarManager.HEIGHT:0;
        return (
            <View style={{height:headerH,width:width,backgroundColor:'#FFF'}}>
                <View style={{flexDirection:'row',width:width,height:56,marginTop:this.state.marginTop,alignItems:'center'}}>
                    <TouchableOpacity onPress={()=>this.props.navigation.goBack()}
                                      style={{width:50,height:56,alignItems:'center',justifyContent:'center'}}>
                        <Image style={{width:15,height:15,resizeMode:'contain'}}
                               source={ require('../../../img/top_back_green.png')}/>
                    </TouchableOpacity>
                    <Text style={{flex:1,textAlign:'center',fontSize:15,color:'#333333'}}>药品库导入</Text>
                    <View style={{width:50,height:56}}/>
                </View>
                <View style={{flexDirection:'row',width:width,alignItems:'center',justifyContent:'center'}}>
                    <View
                        style={{flexDirection:'row',borderColor:'#FFF',borderWidth:1,borderRadius:2,backgroundColor:"#F5F5F5",width:width-10,marginLeft:5,padding:5,alignItems:'center',height:34,marginRight:5}}>
                        <Image style={{width:20,height:20,resizeMode:'contain'}}
                               source={require('../../../img/second_normal.png')}/>
                        <TextInput ref={'search'}
                                   style={{flex:1,marginLeft:5,marginRight:5,fontSize:12,color:'#16c08e',padding:0}}
                                   underlineColorAndroid='transparent'
                                   placeholder="搜索药品名称或编号"
                                   placeholderTextColor="#999999"
                                   value={this.state.medicienName}
                                   onChangeText={(text)=>{
                                       text = text.replace(EMOJIS,'')
                                       this.setState({medicienName : text})
                                   }}
                                   allowFontScaling={true}
                        />
                        <TouchableOpacity onPress = {()=>this._onSearchClick()}>
                            <Text style={{fontSize:12,color:"#333333",width:34,textAlign:'center'}}>
                                搜索
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{flex:1}}/>
                <AndroidHeaderBottomLine/>
            </View>
        )
    }

    _setKeyWord(text){
        this.setState({
            medicienName:text
        })
    }


    _onSearchClick() {
        this.refs.search&&this.refs.search.blur()
        YFWNativeManager.mobClick('account-drug reminding-info-add from drug store-search');
        if(isEmpty(this.state.medicienName)){
            YFWToast('请输入要搜索的药品信息')
            return;
        }
        this.props.searchMedicien(this.state.medicienName)
    }
}

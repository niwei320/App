/**
 * Created by admin on 2018/8/2.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    TextInput,
    DeviceEventEmitter,
    Platform
} from 'react-native';
import {kScreenWidth,isNotEmpty,dismissKeyboard_yfw} from "../../PublicModule/Util/YFWPublicFunction";
import { EMOJIS } from '../../PublicModule/Util/RuleString';

export  default class YFWShopDetailGoodsListHeader extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            keyWord: '',
        }
    }

    keyWordTextChange(text) {
        if (this.mounted) {
            text = text.replace(EMOJIS,'')
            this.setState({
                    keyWord: text
                }
            )
        }
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        // 移除
        if (this.subscription) {
            this.subscription.remove();
        }

        this.mounted = false;
    }

    pushKeyWord() {
        let keyWord = this.state.keyWord;
        return keyWord;
    }

    render() {
        if (Platform.OS == "ios") {
            return (
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <View
                        style={{flexDirection:'row',alignItems:'center',backgroundColor:'#F5F5F5',borderRadius:15,width:kScreenWidth-100,marginLeft:30,marginVertical:7,height:30}}>
                        <Image style={{width:13,height:13,resizeMode:'contain',marginLeft:10}}
                                source={require('./../../../img/top_bar_search.png')}/>
                        <TextInput
                            style={{flex:1,padding:0,marginLeft:5,fontSize:14}}
                            underlineColorAndroid='transparent'
                            onChangeText={this.keyWordTextChange.bind(this)}
                            placeholderTextColor="#999999"
                            value={this.state.keyWord}
                            placeholder={this.props.placeholder}
                            returnKeyType={'search'}
                            onSubmitEditing={(event) => {this._searchClick()}}
                        >

                        </TextInput>
                        {this._renderDeleteIcon()}
                    </View>
                    <TouchableOpacity hitSlop={{left:0,top:10,bottom:10,right:10}} activeOpacity={1} onPress={this._searchClick.bind(this)}>
                        <Text style={{marginLeft:20,fontSize:15,color:'#fff'}}>{this.props.tipsText}</Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View style={[{flexDirection:'row',alignItems:'center',marginLeft:-15}]}>
                    <View style={{width:kScreenWidth-100,height:30,borderRadius:15,borderWidth:0.5,borderColor:'#F5F5F5',backgroundColor:'#F5F5F5',alignItems:'center',flexDirection:'row'}}>
                        <Image style={{width: 13, height: 13, marginLeft:5}}
                                source={require('../../../img/top_bar_search.png')}
                                defaultSource={require('../../../img/top_bar_search.png')}/>
                        <TextInput
                            style={{padding:0,marginLeft:5,fontSize:14,flex:1}}
                            underlineColorAndroid='transparent'
                            onChangeText={this.keyWordTextChange.bind(this)} value={this.state.keyWord}
                            placeholder={this.props.placeholder}
                            placeholderTextColor="#999999"
                            returnKeyType={'search'}
                            onSubmitEditing={(event) => {this._searchClick()}}
                        >

                        </TextInput>
                        {this._renderDeleteIcon()}
                    </View>
                    <View style={{flex : 1}}/>
                    <TouchableOpacity hitSlop={{left:0,top:10,bottom:10,right:10}} activeOpacity={1}
                                      onPress={this._searchClick.bind(this)}>
                        <Text style={{marginRight:15,fontSize:15,color:'#fff'}}>{this.props.tipsText}</Text>
                    </TouchableOpacity>
                </View>



            )
        }
    }

    _searchClick() {
        dismissKeyboard_yfw();

        if (this.state.keyWord && this.state.keyWord.length > 0 ||this.state.keyWord == '') {
            this.props.onSerchClick(this.state.keyWord)
        }
    }

    _renderDeleteIcon() {
        if(isNotEmpty(this.state.keyWord) && this.state.keyWord.length>0){
            return(<TouchableOpacity activeOpacity={1} onPress = {()=>this._removeKeywords()}>
                <Image style={{width:16,height:16,resizeMode:'contain',marginRight:5}} source={require('../../../img/search_del.png')}/>
            </TouchableOpacity>)
        }else {
            return(<View/>)
        }
    }

    _removeKeywords() {
        this.setState({keyWord:''})
    }
}


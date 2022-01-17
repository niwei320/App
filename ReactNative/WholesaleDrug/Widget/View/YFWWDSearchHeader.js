import React, { Component } from 'react';
import {
    DeviceEventEmitter,
    Image,
    NativeEventEmitter,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { YFWImageConst } from '../../Images/YFWImageConst';
import { kScreenWidth, isIphoneX, isEmpty, kStatusHeight, kNavigationHeight } from '../../../PublicModule/Util/YFWPublicFunction';
import LinearGradient from 'react-native-linear-gradient';
import YFWWDBaseView from '../../Base/YFWWDBaseView';
import { EMOJIS } from '../../../PublicModule/Util/RuleString';
import YFWWDMore from './YFWWDMore';

export default class YFWWDSearchHeader extends YFWWDBaseView {

    constructor(props) {
        super(props);
        this.state = {
            text : ''
        }
    }

    componentWillReceiveProps(props) { 
        this.props =  props  
    }

    
    render() {
        return (
            <LinearGradient style={{width:kScreenWidth,height:kNavigationHeight,flexDirection:'row'}} colors={['rgb(65,109,255)','rgb(82,66,255)']} start={{x: 1, y: 0}} end={{x: 0, y: 1}} locations={[0,1]}>
                <TouchableOpacity onPress={() => this.backMethod()} activeOpacity={1} style={styles.backbotton_style}>
                    <Image style={styles.backicon_style} source={ YFWImageConst.Nav_back_white}/>
                </TouchableOpacity>
                <View style={styles.search_view_style} onPress={() => { }}>
                    <View style={styles.search_content_style}>
                        <Image style={styles.search_icon_style} source={YFWImageConst.Btn_bar_search_gray}/>
                        <TextInput ref={(searchInput)=>this._searchInput = searchInput}
                            placeholder={isEmpty(this.shopID)?'搜索症状、药品、药店、品牌':'搜索症状、药品、品牌'}
                            placeholderTextColor="#cccccc"
                            onChangeText={(text) => {this.onChangeText(text)}}
                            onSubmitEditing={(event) => {this.searchClick(event.nativeEvent.text)}}
                            value = {this.state.text}
                            returnKeyType={'search'}
                            selectionColor={'#3369ff'}
                            underlineColorAndroid='transparent'
                            style={{ padding: 0, flex: 1, marginLeft: 5, marginRight: 5, fontSize: 14 }} />
                        <TouchableOpacity onPress={() => this.toScanView()}>
                            <Image style={styles.search_scan_style} source={YFWImageConst.Btn_qr_scan}/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.morebooton_style}>
                    <YFWWDMore/>
                </View>
            </LinearGradient>
        )
    }

    backMethod() { 
        this.props.father&&this.props.father.backMethod&&this.props.father.backMethod()
    }

    onChangeText(text) { 
        this.state.text = text.replace(EMOJIS, '')
        this.setState({})
    }

    searchClick() { 
        this.props.father&&this.props.father.searchClick&&this.props.father.searchClick(this.state.text)
    }

    toScanView() { 
        this.props.father&&this.props.father.searchClick&&this.props.father.toScanView()
    }
}

const styles = StyleSheet.create({
    backbotton_style: { width: 50, height: 40, justifyContent: 'center', marginTop: kStatusHeight },
    backicon_style: { width: 11, height: 19, marginLeft: 12, resizeMode: 'contain' },
    search_view_style: { flex: 1, height: 40, justifyContent: 'center', marginTop: kStatusHeight, marginLeft: 1, marginRight: 5 },
    search_content_style: { height: 34, borderRadius: 17, backgroundColor: 'white', alignItems: 'center', flexDirection: 'row' },
    search_icon_style: { width: 15, height: 16, marginLeft: 15 },
    search_scan_style: { width: 15, height: 16, marginRight: 15 },
    search_placeholder_style: { flex: 1, marginLeft: 10, marginRight: 10, fontSize: 14, color: 'white' },
    morebooton_style: { width: 50, height: 40, marginTop: kStatusHeight, justifyContent: 'center' },
});
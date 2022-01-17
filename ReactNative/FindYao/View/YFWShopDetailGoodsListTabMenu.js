import React from 'react'
import {
    View,
    Text,
    Dimensions,
    Image,
    TouchableOpacity,
    ImageBackground
} from 'react-native'

const width = Dimensions.get('window').width;
import ModalDropdown from '../../widget/YFWMenuList'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import { kScreenWidth } from '../../PublicModule/Util/YFWPublicFunction';
import YFWUserInfoManager from '../../Utils/YFWUserInfoManager';
export default class YFWShopDetailGoodsListTabMenu extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tabs: ['默认', '价格', '分类'],
            selectTab: 0,
            priceDerection: true,
        }
        this.tableStyle = YFWUserInfoManager.ShareInstance().tableStyle
    }

    render() {
        let icon = ''
        if (this.tableStyle) {
            icon = require('../../../img/medicine_map_gray.png');
        } else {
            icon = require('../../../img/medicine_list_gray.png');
        }
        return (
            <ImageBackground source={require('../../../img/Status_bar.png')} style={{width:kScreenWidth, height:60,paddingTop:5}}>
                <View style={{width:width,flexDirection:'row',height:60,backgroundColor:'#FFFFFF',justifyContent:'space-around', borderTopLeftRadius:7, borderTopRightRadius:7}}>
                    {this._renderTabItem()}
                    <TouchableOpacity style={{flex:2,height:60,alignItems:'center',justifyContent:'center'}} onPress = {()=>this._changeListStyle()} activeOpacity={1}>
                        <Image source={icon}
                               style={{height:16,width:16,resizeMode:'stretch'}}/>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        )
    }

    _changeListStyle(){
        this.props._showTypeChange()
    }

    refreshView(tableStyle){
        this.tableStyle = tableStyle
        this.setState({})
    }

    changeSelectedTabItem(){
        this.setState({
            selectTab:0
        })
    }

    _renderTabItem() {
        return this.state.tabs.map((item, index)=> {
            let color = this.state.selectTab == index ? '#16c08e' : '#999999';
            return (
                <View key={index+'c'} style={{flex:3}}>
                    <TouchableOpacity style={{flex:1}} activeOpacity={1}
                                      onPress={()=>{this._onTabItemClick(index)}}>
                        <View style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'center'}}>
                            <Text style={{fontSize:15,color:color,fontWeight:'bold'}}>{item}</Text>
                            {this._renderTabIcon(item, index)}
                        </View>
                    </TouchableOpacity>
                </View>
            )
        })
    }

    _renderTabIcon(item, index) {
        if (index == this.state.selectTab) {
            if (index == 1) {
                let image = this.state.priceDerection ? require('../../../img/order_by_plus.png') : require('../../../img/order_by_minus.png');
                return (<Image source={image}
                            style={{resizeMode: 'contain',height:10,width:10,marginLeft:5}}/>)
            } else if (index == 2) {
                return (<Image source={require('../../../img/shop_search_green.png')}
                            style={{resizeMode: 'contain',height:5,width:5,marginLeft:5}}/>)
            } else {
                return <View/>
            }
        } else {
            if (index == 1) {
                return (<Image source={require('../../../img/order_by_default.png')}
                            style={{resizeMode: 'contain',height:10,width:10,marginLeft:5}}/>)
            } else if (index == 2) {
                return (<Image source={require('../../../img/shop_search_gray.png')}
                            style={{resizeMode: 'contain',height:5,width:5,marginLeft:5}}/>)
            }else {
                return <View/>
            }
        }
    }

    _onTabItemClick(index) {
        if (index == 1) {
            if (this.state.selectTab == 1) {
                this.state.priceDerection = !this.state.priceDerection
            } else {
                this.state.selectTab = index
                this.setState({})
            }
        } else {
            this.state.selectTab = index
            this.state.priceDerection = true
            this.setState({})
        }
        this.props.changeKindMenuStatus(index,this.state.priceDerection)
    }
}

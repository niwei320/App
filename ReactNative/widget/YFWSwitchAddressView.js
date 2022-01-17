/**
 * Created by nw on 2018/9/12.
 */

import React, {Component} from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    FlatList,
    DeviceEventEmitter,
    Image
} from 'react-native';
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {itemAddKey, kScreenWidth, isEmpty, isNotEmpty} from "../PublicModule/Util/YFWPublicFunction";
import {separatorColor, yfwGreenColor, darkLightColor, darkTextColor,yfwRedColor} from "../Utils/YFWColor";
import YFWRequestViewModel from '../Utils/YFWRequestViewModel';
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWChooseAddressViewModel from "../UserCenter/Model/YFWChooseAddressViewModel";
import {getItem, ChooseAddressProvinceData,setItem} from "../Utils/YFWStorage";
import ModalView from './ModalView'


export default class YFWSwitchAddressView extends Component {

    constructor(...args) {
        super(...args);
        this.allProvinceData = [];
        this.allCityData = [];
        this.allCountryData = [];
        this.state = {
            dataArray: [],
            addresMap: new Map(),
            hidequxian: false,
            clickIndex: undefined,
            isCanSure: false,
            countryRequest: true
        };
        this.type = 'default'
    }

    //Action
    showView(type) {
        this.type = type
        this.handleProvinceData();
        this.modalView && this.modalView.show()
    }

    closeView() {
        this.allProvinceData = [];
        this.allCityData = [];
        this.allCountryData = [];
        this.state.addresMap = new Map();
        this.state.countryRequest = true;
        this.modalView && this.modalView.disMiss()
    }

    handleProvinceData() {
        // getItem(ChooseAddressProvinceData).then((data)=> {
        //     if (isNotEmpty(data)) {
        //         itemAddKey(data);
        //         this.allProvinceData = data;
        //         this.setState({
        //             dataArray: data,
        //             clickIndex: 'one',
        //             isCanSure: false,
        //         },()=>{
        //             this.listScrollToTop()
        //         });
        //     } else {
                let paramMap = new Map();
                paramMap.set('__cmd', 'guest.sys_region.getListByParentId');
                paramMap.set('regionid', 0);
                let viewModel = new YFWRequestViewModel();
                viewModel.TCPRequest(paramMap, (res) => {
                    let data = YFWChooseAddressViewModel.getModelData(res.result);
                    // setItem(ChooseAddressProvinceData,data);
                    itemAddKey(data);
                    this.allProvinceData = data;
                    this.setState({
                        dataArray: data,
                        clickIndex: 'one',
                        isCanSure: false,
                    },()=>{
                        this.listScrollToTop()
                    });
                });
        //     }
        //
        // });
    }

    handleCityData(item) {
        // getItem('ChooseAddressCityData'+item.id).then((data)=> {
        //     if(isNotEmpty(data)){
        //         itemAddKey(data);
        //         this.allCityData = data;
        //
        //         this.state.dataArray = data
        //         this.state.clickIndex = 'two'
        //         this.state.hidequxian = this.state.hidequxian
        //         this.state.isCanSure = false
        //         this.state.countryRequest = true
        //         this.setState({},()=>{
        //             this.listScrollToTop()
        //         });
        //     }else {
                let paramMap = new Map();
                paramMap.set('__cmd', 'guest.sys_region.getListByParentId');
                paramMap.set('regionid', item.id);
                let viewModel = new YFWRequestViewModel();
                viewModel.TCPRequest(paramMap, (res) => {
                    let data = YFWChooseAddressViewModel.getModelData(res.result);
                    // setItem('ChooseAddressCityData'+item.id,data)
                    itemAddKey(data);
                    this.allCityData = data;

                    this.state.dataArray = data
                    this.state.clickIndex = 'two'
                    this.state.hidequxian = this.state.hidequxian
                    this.state.isCanSure = false
                    this.state.countryRequest = true
                    this.setState({},()=>{
                        this.listScrollToTop()
                    });
                });
        //     }
        // })
    }

    handleCountryData(item) {
        if (this.state.countryRequest) {
        //     getItem('ChooseAddressCountryData'+item.id).then((data)=> {
        //         if(isNotEmpty(data)){
        //             itemAddKey(data);
        //             this.allCountryData = data;
        //             if (data.length > 0) {
        //                 this.state.dataArray = data
        //                 this.state.clickIndex = 'three'
        //                 this.state.hidequxian = false
        //                 this.state.isCanSure = false
        //                 this.setState({},()=>{
        //                     this.listScrollToTop()
        //                 });
        //             } else {
        //                 this.state.hidequxian = true
        //                 this.state.isCanSure = true
        //                 this.state.countryRequest = false
        //                 this.setState({})
        //             }
        //             this.sureButtonClick()
        //         }else {
                    let paramMap = new Map();
                    paramMap.set('__cmd', 'guest.sys_region.getListByParentId');
                    paramMap.set('regionid', item.id);
                    let viewModel = new YFWRequestViewModel();
                    viewModel.TCPRequest(paramMap, (res) => {
                        let data = YFWChooseAddressViewModel.getModelData(res.result);
                        // setItem('ChooseAddressCountryData'+item.id,data)
                        itemAddKey(data);
                        this.allCountryData = data;
                        if (data.length > 0) {
                            this.state.dataArray = data
                            this.state.clickIndex = 'three'
                            this.state.hidequxian = false
                            this.state.isCanSure = false
                            this.setState({},()=>{
                                this.listScrollToTop()
                            });
                        } else {
                            this.state.hidequxian = true
                            this.state.isCanSure = true
                            this.state.countryRequest = false
                            this.setState({})
                        }
                        this.sureButtonClick()
                    });
            //     }
            // })
        } else {
            this.setState({})
        }
    }

    listScrollToTop() {
        setTimeout(() => {
            if (this.listView) {
                this.listView.scrollToOffset({animated:true,offset:0});
            }
        }, 200);

    }

    quxianView() {
        if (this.state.hidequxian) {
            return null;
        } else {
            return this._renderTitleItem(this.selectAddressText(2), 'three');
        }
    }

    colorBar(index) {
        if (this.state.clickIndex == index) {
            return <View style={{backgroundColor:yfwGreenColor(),marginBottom:1,width:30,height:3}}/>
        } else {
            return <View style={{backgroundColor:'white',marginBottom:1,width:30,height:3}}/>
        }
    }

    selectAddressText(index) {
        if (index == 0) {
            if (this.state.addresMap.get('one')) {
                return this.state.addresMap.get('one').name;
            } else {
                return '省份'
            }
        } else if (index == 1) {
            if (this.state.addresMap.get('two')) {
                return this.state.addresMap.get('two').name;
            } else {
                return '城市'
            }
        } else {
            if (this.state.addresMap.get('three')) {
                return this.state.addresMap.get('three').name;
            } else {
                return '区县'
            }
        }
    }

    provinceClick() {
        if (this.allProvinceData.length > 0) {
            this.setState({
                dataArray: this.allProvinceData,
                clickIndex: 'one',
            });
        }
    }

    cityClick() {
        if (this.allCityData.length > 0) {
            this.setState({
                dataArray: this.allCityData,
                clickIndex: 'two',
            });
        }
    }

    quxianClick() {
        if (this.allCountryData.length > 0) {
            this.setState({
                dataArray: this.allCountryData,
                clickIndex: 'three',
            });
        }
    }

    sureButtonClick() {
        if (this.state.isCanSure && this.state.addresMap.get('one') && this.state.addresMap.get('two')) {
            var value = new Map();
            var address;
            address = this.state.addresMap.get('one').name + this.state.addresMap.get('two').name
            value.set('id', this.state.addresMap.get('two').id);
            if (this.state.addresMap.get('three')) {
                address += this.state.addresMap.get('three').name
                value.set('id', this.state.addresMap.get('three').id);
            }
            value.set('name', address)

            DeviceEventEmitter.emit('AddressBack', value);
            this.props.addressCallBack && this.props.addressCallBack(value);
            this.closeView();
        }
    }

    renderAlertView() {
        if (this.type == 'regist') {
            return (
                <View style={[{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.3)'}]}>
                    <TouchableOpacity onPress={()=>this.closeView()} style={{flex:1}}/>
                    <View style={{ backgroundColor: 'white', flex: 1 ,borderTopLeftRadius:10,borderTopRightRadius:10}}>
                        <Text style={{ fontSize: 16, color: '#333333', marginLeft: 16, marginTop: 20 }}>{'请选择来自何地'}</Text>
                        <View style={{flexDirection:'row',paddingLeft:16,width:kScreenWidth,height:50}}>
                            <TouchableOpacity onPress={() => { }}>
                                <View style={[BaseStyles.centerItem,{height:42,marginRight:10,overflow:'hidden',flex:1}]}>
                                    <Text style={{color:darkTextColor(), fontSize:15, zIndex:10,marginHorizontal:3}}>{'中国大陆'}</Text>
                                    <Image source={require('../../img/title_bottom_line.png')} style={{height:12, resizeMode:'stretch', position:'absolute', left:-30,right:0,bottom:7, flex:1}}/>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { DeviceEventEmitter.emit('AddressBack', new Map([[ 'id', '99999'],[ 'name','港澳台及海外']])); this.closeView(); }} style={{marginLeft:40}}>
                                <View style={[BaseStyles.centerItem,{height:42,marginRight:10,overflow:'hidden',flex:1}]}>
                                    <Text style={{color:darkTextColor(), fontSize:15, zIndex:10,marginHorizontal:3}}>{'港澳台及海外'}</Text>
                                    <Image source={require('../../img/title_bottom_line.png')} style={{height:12, resizeMode:'stretch', position:'absolute', left:-30,right:0,bottom:7, flex:1,opacity:0}}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{height:43,width:kScreenWidth, paddingLeft:16}}>
                            <View style={{flexDirection:'row',height:42}}>
                                <TouchableOpacity onPress={()=>this.provinceClick()}>
                                    {this._renderTitleItem(this.selectAddressText(0), 'one')}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>this.cityClick()}>
                                    {this._renderTitleItem(this.selectAddressText(1), 'two')}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>this.quxianClick()}>
                                    {this.quxianView()}
                                </TouchableOpacity>
                                <View style={{flex:1}}></View>
                            </View>
                            <View style={{height:1,width:kScreenWidth,backgroundColor:separatorColor()}}/>
                        </View>
                        <FlatList
                            ref={(e)=>this.listView = e}
                            data={this.state.dataArray}
                            renderItem={this._renderItem}
                            style={{flex:1,paddingTop:10}}
                            // getItemLayout={(data, index) => (
                            //     {length: 40, offset: 40*index, index}
                            // )}
                        />
                    </View>
                </View>
            );
        } else {
            return (
                <View style={[{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.3)'}]}>
                    <TouchableOpacity onPress={()=>this.closeView()} style={{flex:1}}/>
                    <View style={{ backgroundColor: 'white', flex: 1 }}>
                        <View style={{height:43,width:kScreenWidth, paddingLeft:16}}>
                            <View style={{flexDirection:'row',height:42}}>
                                <TouchableOpacity onPress={()=>this.provinceClick()}>
                                    {this._renderTitleItem(this.selectAddressText(0), 'one')}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>this.cityClick()}>
                                    {this._renderTitleItem(this.selectAddressText(1), 'two')}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>this.quxianClick()}>
                                    {this.quxianView()}
                                </TouchableOpacity>
                                <View style={{flex:1}}></View>
                                {/* <TouchableOpacity onPress={()=>this.sureButtonClick()}>
                                    <View style={[BaseStyles.rightCenterView,{width:60,height:42}]}>
                                        <Text style={{color:darkLightColor(), fontSize:15}}>{'确定    '}</Text>
                                    </View>
                                </TouchableOpacity> */}
                            </View>
                            <View style={{height:1,width:kScreenWidth,backgroundColor:separatorColor()}}/>
                        </View>
                        <FlatList
                            ref={(e)=>this.listView = e}
                            data={this.state.dataArray}
                            renderItem={this._renderItem}
                            style={{flex:1,paddingTop:10}}
                            // getItemLayout={(data, index) => (
                            //     {length: 40, offset: 40*index, index}
                            // )}
                        />
                    </View>
                </View>
            );
        }

    }

    _renderTitleItem(title, index) {
        let opacity = this.state.clickIndex == index ? 1 : 0
        return(
            <View style={[BaseStyles.centerItem,{height:42,marginRight:10,overflow:'hidden',flex:1}]}>
                <Text style={{color:darkTextColor(), fontSize:15, zIndex:10,marginHorizontal:3}}>{title}</Text>
                <Image source={require('../../img/title_bottom_line.png')} style={{height:12, resizeMode:'stretch', position:'absolute', left:-30,right:0,bottom:7, flex:1, opacity:opacity}}/>
            </View>
        )
    }

    _renderItem = (item) => {
        var txt = item.item.name;
        let region_id = item.item.id;
        var text_color;
        if (this.state.addresMap.get(this.state.clickIndex) && this.state.addresMap.get(this.state.clickIndex).id == region_id) {
            text_color = yfwRedColor()
        } else {
            text_color = darkTextColor()
        }
        return (
            <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this,item)}>
                <View style={{justifyContent:'center',flex:1,height:40,backgroundColor:'white'}}>
                    <Text style={{color:text_color, fontSize:15}}>{'     ' + txt}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    clickItem(item) {
        if (this.state.clickIndex == 'one') {
            this.state.addresMap.delete('two');
            this.state.addresMap.delete('three');
            this.state.addresMap.set('one', item.item);
            this.handleCityData(item.item)
        } else if (this.state.clickIndex == 'two') {
            var tempMap = this.state.addresMap;
            tempMap.set('two', item.item);
            this.state.addresMap.delete('three');
            this.state.addresMap.set('two', item.item);
            this.handleCountryData(item.item)
        } else {
            this.state.addresMap.set('three', item.item);
            this.state.clickIndex = 'three'
            this.state.isCanSure = true
            this.setState({});
            this.sureButtonClick()
        }
    }

    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this.renderAlertView()}
            </ModalView>
        );
    }
}
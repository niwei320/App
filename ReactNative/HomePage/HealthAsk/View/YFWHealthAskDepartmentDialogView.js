import React, {Component} from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    Modal,
    FlatList, DeviceEventEmitter,
} from 'react-native';
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import {itemAddKey, kScreenHeight, kScreenWidth, safeObj} from "../../../PublicModule/Util/YFWPublicFunction";
import {separatorColor, yfwGreenColor} from "../../../Utils/YFWColor";
import YFWRequestViewModel from '../../../Utils/YFWRequestViewModel';
import YFWHealthAskAllDepartmentModel from "../Model/YFWHealthAskAllDepartmentModel";
import YFWTitleView from '../../../PublicModule/Widge/YFWTitleView'
export default class YFWHealthAskDepartmentDialogView extends Component {

    constructor(...args) {
        super(...args);
        this.state = {
            status_modal:false,
            dataArray:[],
            departmentMap:new Map(),
            clickIndex:undefined,
            isCanClose:false,
            selectIndex:0
        };
    }

    //Action
    showView() {
        this.handleProvinceData(0);
    }

    clickItem(item) {
        var tempMap = this.state.departmentMap;
        let data = this.state.dataArray[item.index].item;
        if (this.state.clickIndex == 0){
            this.state.departmentMap.delete('two');
            tempMap.set('one',this.state.dataArray[item.index]);
            itemAddKey(data);
            this.setState({
                status_modal:true,
                dataArray:data,
                clickIndex:1,
                departmentMap:tempMap,
                isCanClose:false,
                selectIndex:1
            });
        }else if (this.state.clickIndex == 1){
            tempMap.set('two',this.state.dataArray[item.index]);
            this.setState({
                status_modal:true,
                clickIndex:1,
                isCanClose:true,
                selectIndex:1
            });
        }
    }

    closeView(){
        this.setState({
            status_modal:false,
        });
    }

    provinceClick(){
        this.handleProvinceData();
        this.setState({
            selectIndex:0
        })
    }

    cityClick(){
        let item = this.state.departmentMap.get('one');
        if (item){
            let data = item.item;
            itemAddKey(data);
            this.setState({
                status_modal:true,
                dataArray:data,
                clickIndex:1,
                selectIndex:1
            });
        }
    }

    handleProvinceData(value){
        var tempMap
        if (value == 0){
            tempMap = new Map();
        } else {
            tempMap = this.state.departmentMap;
        }

        let paramMap = new Map();
        paramMap.set('__cmd' , 'guest.ask.getAllDepartment');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            let data = YFWHealthAskAllDepartmentModel.getModelArray(res.result);
            let array = safeObj(safeObj(data).item)
            itemAddKey(array);
            this.setState({
                status_modal:true,
                dataArray:array,
                clickIndex:0,
                departmentMap:tempMap,
                isCanClose:false,
            });
        });

    }
    sureButtonClick(){
        if (this.state.isCanClose) {
            let value = this.state.departmentMap.get('two')
            DeviceEventEmitter.emit('DepartmentBack',value);
            this.closeView();
        }
    }

    colorBar(index){
        if (this.state.clickIndex == index){
            return <View style={{backgroundColor:yfwGreenColor(),marginBottom:1,width:30,height:3}}></View>
        } else {
            return <View style={{backgroundColor:'white',marginBottom:1,width:30,height:3}}></View>
        }
    }

    selectAddressText(index){
        if(index == 0){
            if (this.state.departmentMap.get('one')){
                return this.state.departmentMap.get('one').dep_name;
            } else{
                return '选择科室'
            }

        }else if(index == 1) {
            if (this.state.departmentMap.get('two')) {
                return this.state.departmentMap.get('two').dep_name;
            } else {
                return '分类'
            }
        }
    }
    renderAlertView(){
        return (
            <View style={[{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.3)'}]}>
                <TouchableOpacity onPress={()=>this.closeView()} style={{flex:1}}/>
                <View style={{backgroundColor:'white',flex:1}}>
                    <View style={{height:50,width:kScreenWidth}}>
                        <View style={{flexDirection:'row',height:45,width:210}}>
                            <TouchableOpacity onPress={()=>this.provinceClick()}>
                                <View style={[BaseStyles.centerItem,{flex: 1,height:40,width:105}]}>
                                    {/* <Text style={{color:'black'}}>{this.selectAddressText(0)}</Text> */}
                                    <YFWTitleView title={this.selectAddressText(0)} style_title={{width:15*this.selectAddressText(0).length+10, fontSize:14}} hiddenBgImage={this.state.selectIndex==0?false:true}/>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>this.cityClick()}>
                                <View style={[BaseStyles.centerItem,{flex: 1,height:40,width:105}]}>
                                    {/* <Text style={{color:'black'}}>{this.selectAddressText(1)}</Text> */}
                                    <YFWTitleView title={this.selectAddressText(1)} style_title={{width:15*this.selectAddressText(1).length+10, fontSize:14}} hiddenBgImage={this.state.selectIndex==1?false:true}/>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={()=>this.sureButtonClick()}>
                                <View style={[BaseStyles.rightCenterView,{flex: 1,height:40,width:kScreenWidth-70*3}]}>
                                    <Text style={{color:'black'}}>{'确定'+'    '}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        {/* <View style={{flexDirection:'row',height:3,width:210}}>
                            <View style={[BaseStyles.centerItem,{flex: 1,height:3,width:105}]}>
                                {this.colorBar(0)}
                            </View>
                            <View style={[BaseStyles.centerItem,{flex: 1,height:3,width:105}]}>
                                {this.colorBar(1)}
                            </View>
                        </View> */}
                        <View style={{height:2,width:kScreenWidth,backgroundColor:separatorColor()}}/>
                    </View>
                    <FlatList
                        data={this.state.dataArray}
                        renderItem={this._renderItem}
                        style={{flex:1}}
                    />
                </View>
            </View>
        );
    }

    _renderItem = (item) => {
        var mapIndex;
        if (this.state.clickIndex == 0){
            mapIndex = 'one'
        } else if(this.state.clickIndex == 1){
            mapIndex = 'two'
        }
        var txt = this.state.dataArray[item.index].dep_name;
        let dep_id = this.state.dataArray[item.index].dep_id;
        var text_color;
        if (this.state.departmentMap.get(mapIndex)&&this.state.departmentMap.get(mapIndex).dep_id == dep_id){
            text_color = 'red'
        }else {
            text_color = '#999999'
        }

        return (
            <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this,item)}>
                <View style={{justifyContent:'center',flex:1,height:40,backgroundColor:'white'}}>
                    <Text style={{color:text_color}}>{'     '+txt}</Text>
                </View>
            </TouchableOpacity>
        );
    }


    render() {
        return (
            <Modal
                style={{flex:1}}
                animationType='fade'
                transparent={true}
                visible={this.state.status_modal}
                onRequestClose={() => {

                }}>
                {this.renderAlertView()}
            </Modal>
        );
    }


}


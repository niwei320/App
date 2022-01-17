import React, { Component, UIManager } from 'react';

import {
    Text,
    View,
    TouchableOpacity
} from 'react-native';

import PickerView from './PickerView';
import BaseDialog from './BaseDialog';
import LinearGradient from 'react-native-linear-gradient';
import TimeUtils from './TimeUtils';
import {isEmpty, isNotEmpty} from "../../../../PublicModule/Util/YFWPublicFunction";

class DatePicker extends BaseDialog {

    static defaultProps = {
        removeSubviews: false,
        itemTextColor: 0x333333ff,
        itemSelectedColor: 0x1097D5ff,
        onPickerCancel: null,
        onPickerConfirm: null,
        selectedItemValue: null,
        unit: ['年', '月', '日'],
        selectedValue: [new Date().getFullYear() + '年', (new Date().getMonth() + 1) + '月', new Date().getDate() + '日'],

        selectedType: ['start'],
        startValue: [''],//[new Date().getFullYear() + '年', (new Date().getMonth() + 1) + '月', new Date().getDate() + '日'],
        endValue: [''],

        startYear: '',
        endYear: new Date().getFullYear()+100,

        confirmText: '确定',
        confirmTextSize: 14,
        confirmTextColor: '#333333',

        cancelText: '取消',
        cancelTextSize: 14,
        cancelTextColor: '#333333',

        itemHeight: 40,

        HH: true,
        mm: true,
        ss: false,

        type:'default'                  //default、custom
    }

    constructor(props) {
        super(props);
        this.state = this.getDateList();
    }


    getDateList() {
        console.log(this.props)
        let unit = this.props.unit;
        let years = [];
        let months = [];
        let days = [];

        let startYear = this.props.startYear;
        let endYear = this.props.endYear;
        for (let i = 0; i < endYear + 1 - startYear; i++) {
            years.push(i + startYear + unit[0]);
        }

        let selectedYear = years[0];
        if (this.props.selectedValue) {
            selectedYear = this.props.selectedValue[0];
        }
        selectedYear = selectedYear.substr(0, selectedYear.length - unit[0].length);
        for (let i = 1; i < 13; i++) {
            months.push(i + unit[1]);
        }

        let selectedMonth = months[0];
        if (this.props.selectedValue) {
            selectedMonth = this.props.selectedValue[1];
        }
        selectedMonth = selectedMonth.substr(0, selectedMonth.length - unit[1].length);

        let dayCount = TimeUtils.getDaysInOneMonth(selectedYear, selectedMonth);
        for (let i = 1; i <= dayCount; i++) {
            days.push(i + unit[2]);
        }

        let selectedDay = days[0];
        if (this.props.selectedValue) {
            selectedDay = this.props.selectedValue[2];
        }
        selectedDay = selectedDay.substr(0, selectedDay.length - unit[2].length);

        pickerData = [years, months, days];

        selectedIndex = [
            years.indexOf(selectedYear + unit[0]) == -1 ? years.length - 1 : years.indexOf(selectedYear + unit[0]),
            months.indexOf(selectedMonth + unit[1]),
            days.indexOf(selectedDay + unit[2]) == -1 ? days.length - 1 : days.indexOf(selectedDay + unit[2])];
        this.props.selectedValue[0] = years[selectedIndex[0]];
        this.props.selectedValue[1] = months[selectedIndex[1]];
        this.props.selectedValue[2] = days[selectedIndex[2]];

        if (this.props.selectedType[0] == 'start') {
            this.props.startValue[0] =  this.props.selectedValue[0] + this.props.selectedValue[1] + this.props.selectedValue[2] + ''
        } else {
            this.props.endValue[0] = this.props.selectedValue[0] + this.props.selectedValue[1] + this.props.selectedValue[2] + ''
        }


        if (this.props.HH) {
            let hours = [];
            for (let i = 0; i < 24; i++) {
                hours.push((i + 1) + '时');
            }
            pickerData.push(hours);
            if (this.props.selectedValue) {
                selectedIndex.push((this.props.selectedValue[3] ? parseInt(this.props.selectedValue[3]) : new Date().getHours()) - 1);
            } else {
                selectedIndex.push((new Date().getHours() - 1));
            }
            this.props.selectedValue[3] = (selectedIndex[3] + 1) + '时';
            if (this.props.mm) {
                let minutes = [];
                for (let i = 0; i < 60; i++) {
                    minutes.push((i + 1) + '分');
                }
                pickerData.push(minutes);
                if (this.props.selectedValue) {
                    selectedIndex.push((this.props.selectedValue[4] ? parseInt(this.props.selectedValue[4]) : new Date().getMinutes()) - 1);
                } else {
                    selectedIndex.push((new Date().getMinutes() - 1));
                }
                this.props.selectedValue[4] = (selectedIndex[4] + 1) + '分';
                if (this.props.ss) {
                    let seconds = [];
                    for (let i = 0; i < 60; i++) {
                        seconds.push((i + 1) + '秒');
                    }
                    pickerData.push(seconds);
                    if (this.props.selectedValue) {
                        selectedIndex.push((this.props.selectedValue[5] ? parseInt(this.props.selectedValue[5]) : 1) - 1);
                    } else {
                        selectedIndex.push(1);
                    }
                    this.props.selectedValue[5] = (selectedIndex[5] + 1) + '秒';
                }
            }
        }


        let data = {
            pickerData: pickerData,
            selectedIndex: selectedIndex,
        };
        return data;
    }

    _getContentPosition() {
        return { justifyContent: 'flex-end', alignItems: 'center' }
    }

    renderPicker() {
        return this.state.pickerData.map((item, pickerId) => {
            if (item) {
                return <PickerView
                    key={'picker' + pickerId}
                    itemTextColor={this.props.itemTextColor}
                    itemSelectedColor={this.props.itemSelectedColor}
                    list={item}
                    onPickerSelected={(toValue) => {
                        //是否联动的实现位置
                        this.props.selectedValue[pickerId] = toValue;
                        console.log('====')
                        this.setState({ ...this.getDateList() });
                    }}
                    selectedIndex={this.state.selectedIndex[pickerId]}
                    fontSize={this.getSize(14)}
                    itemWidth={this.mScreenWidth / this.state.pickerData.length}
                    itemHeight={this.props.itemHeight} />
            }
        });
    }

    renderContent() {
        let view = <View/>
        if (this.props.type == 'default') {
            view = <View
                style={{
                    height: this.props.itemHeight * 5 + this.getSize(15) + this.getSize(44) + this.getSize(74), width: this.mScreenWidth,
                    backgroundColor: '#ffffff',borderTopLeftRadius:10,borderTopRightRadius:10
                }}>
                <View style={{ width: this.mScreenWidth, height: this.props.itemHeight * 5 + this.getSize(15), flexDirection: 'row', position: 'absolute', bottom: 74 }}>
                    {this.renderPicker()}
                </View>
                <View style={{
                    width: this.mScreenWidth, height: this.getSize(44),
                    backgroundColor: '#ffffff', flexDirection: 'row',
                    justifyContent: 'space-between', position: 'absolute', top: 0
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            // this.dismiss(() => {
                            //     this.props.onPickerCancel && this.props.onPickerCancel();
                            // });
                        }}
                        style={{ width: this.getSize(60), height: this.getSize(44), justifyContent: 'center', alignItems: 'center' ,marginLeft:10}}>
                        <Text style={{ fontSize: this.props.cancelTextSize, fontWeight: 'bold', color: 'black' }}>{'选择时间'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this.dismiss(() => {
                                // this.props.onPickerConfirm && this.props.onPickerConfirm(this.props.selectedValue);
                            });
                        }}
                        style={{ width: this.getSize(60), height: this.getSize(44), justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: this.props.confirmTextSize, fontWeight: '400', color: this.props.confirmTextColor }}>{this.props.cancelText}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{
                    width: this.mScreenWidth, height: this.getSize(74),
                    backgroundColor: 'white', flexDirection: 'row',
                    justifyContent: 'space-between', position: 'absolute', bottom: 0,paddingHorizontal: this.getSize(36)
                }}>
                    <LinearGradient style={{width:this.mScreenWidth-this.getSize(36)*2,height:this.getSize(42),borderRadius:this.getSize(21)}} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                        <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => this.dismiss(() => {
                            this.props.selectedItemValue && this.props.selectedItemValue(this.props.selectedValue[0]+this.props.selectedValue[1]+this.props.selectedValue[2],this.from)
                            this.callback&&this.callback(this.props.selectedValue[0]+this.props.selectedValue[1]+this.props.selectedValue[2],this.from)
                        })}>
                        <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>{'确定'}</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                </View>
            </View>
        }else if (this.props.type == 'regist') {
            view = <View style={{
                    height: this.props.itemHeight * 5 + this.getSize(15) + this.getSize(44) + this.getSize(20), width: this.mScreenWidth,
                    backgroundColor: '#ffffff', borderTopLeftRadius: 10, borderTopRightRadius: 10,
                }}>
                <View style={{ width: this.mScreenWidth, height: this.props.itemHeight * 5 + this.getSize(15), flexDirection: 'row', position: 'absolute', bottom: 20 }}>
                    {this.renderPicker()}
                </View>
                <View style={{
                    width: this.mScreenWidth, height: this.getSize(44),
                    backgroundColor: '#ffffff', flexDirection: 'row',
                    justifyContent: 'space-between', position: 'absolute', top: 0,
                    borderTopLeftRadius:10,borderTopRightRadius:10
                }}>
                    <TouchableOpacity
                        onPress={() => {this.dismiss(() => {})}}
                        style={{ width: this.getSize(60), height: this.getSize(44), justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: '400', color:'#848898' }}>{'取消'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {}}
                        style={{ width: this.getSize(120), height: this.getSize(44), justifyContent: 'center', alignItems: 'center' ,marginLeft:10}}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>{'请选择时间'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {this.dismiss(() => {
                            this.props.selectedItemValue && this.props.selectedItemValue(this.props.selectedValue[0]+this.props.selectedValue[1]+this.props.selectedValue[2],this.from)
                            this.callback&&this.callback(this.props.selectedValue[0]+this.props.selectedValue[1]+this.props.selectedValue[2],this.from)
                        })}}
                        style={{ width: this.getSize(60), height: this.getSize(44), justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: '400', color: '#1fdb9b' }}>{'确定'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        } else {
            view = <View
                style={{
                    height: this.props.itemHeight * 5 + this.getSize(15) + this.getSize(44)+ this.getSize(70) + this.getSize(74), width: this.mScreenWidth,
                    backgroundColor: '#ffffff',borderTopLeftRadius:10,borderTopRightRadius:10
                }}>
                <View style={{ width: this.mScreenWidth, height: this.props.itemHeight * 5 + this.getSize(15), flexDirection: 'row', position: 'absolute', bottom: 74 }}>
                    {this.renderPicker()}
                </View>
                <View style={{
                    width: this.mScreenWidth, height: this.getSize(44),
                    backgroundColor: '#ffffff', flexDirection: 'row',
                    justifyContent: 'space-between', position: 'absolute', top: 0
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            // this.dismiss(() => {
                            //     this.props.onPickerCancel && this.props.onPickerCancel();
                            // });
                        }}
                        style={{ width: this.getSize(60), height: this.getSize(44), justifyContent: 'center', alignItems: 'center' ,marginLeft:10}}>
                        <Text style={{ fontSize: this.props.cancelTextSize, fontWeight: 'bold', color: 'black' }}>{'选择时间'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this.dismiss(() => {
                                // this.props.onPickerConfirm && this.props.onPickerConfirm(this.props.selectedValue);
                            });
                        }}
                        style={{ width: this.getSize(60), height: this.getSize(44), justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: this.props.confirmTextSize, fontWeight: '400', color: this.props.confirmTextColor }}>{this.props.cancelText}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{
                    width: this.mScreenWidth, height: this.getSize(70),
                    backgroundColor: 'white', flexDirection: 'row',alignItems:'center',
                    justifyContent: 'center', position: 'absolute', top: this.getSize(44)
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            this.props.selectedType[0] = 'start';
                            if(this.props.startValue[0] != ''){
                                let selectedValue = this.parsStringToSelectedValue(this.props.startValue[0])
                                this.props.selectedValue[0] = selectedValue[0];
                                this.props.selectedValue[1] = selectedValue[1];
                                this.props.selectedValue[2] = selectedValue[2];
                            }
                            this.setState({
                                ...this.getDateList()
                            });
                        }}
                        activeOpacity={1}
                        style={{height:this.getSize(30),width:this.getSize(117),borderBottomColor:this.props.selectedType[0] == 'start'?'rgb(65,109,255)':'rgb(153,153,153)',borderBottomWidth:2,alignItems:'center',justifyContent:'center'}}
                    >
                        <Text style={{ fontSize: 15, color: 'rgb(51,51,51)' }}>{this.props.startValue[0]}</Text>
                    </TouchableOpacity>
                    <Text style={{fontSize:14,color:'rgb(51,51,51)',marginHorizontal:this.getSize(14)}}>至</Text>
                    <TouchableOpacity
                        onPress={() => {
                            this.props.selectedType[0] = 'end';
                            if(this.props.endValue[0] != ''){
                                let selectedValue = this.parsStringToSelectedValue(this.props.endValue[0])
                                this.props.selectedValue[0] = selectedValue[0];
                                this.props.selectedValue[1] = selectedValue[1];
                                this.props.selectedValue[2] = selectedValue[2];
                            }
                            this.setState({ ...this.getDateList() });
                        }}
                        activeOpacity={1}
                        style={{height:this.getSize(30),width:this.getSize(117),borderBottomColor:this.props.selectedType[0] == 'end'?'rgb(65,109,255)':'rgb(153,153,153)',borderBottomWidth:2,alignItems:'center',justifyContent:'center'}}
                    >
                        <Text style={{ fontSize: 15, color: this.props.endValue[0]==''?'rgb(153,153,153)':'rgb(51,51,51)' }}>{this.props.endValue[0]==''?'请输入截止时间':this.props.endValue[0]}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{
                    width: this.mScreenWidth, height: this.getSize(74),
                    backgroundColor: 'white', flexDirection: 'row',
                    justifyContent: 'space-between', position: 'absolute', bottom: 0,paddingHorizontal: this.getSize(36)
                }}>
                    <LinearGradient style={{width:this.mScreenWidth-this.getSize(36)*2,height:this.getSize(42),borderRadius:this.getSize(21)}} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                        <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => this.dismiss(() => {
                            this.props.selectedItemValue && this.props.selectedItemValue([this.props.startValue[0], this.props.endValue[0]])
                            this.callback&&this.callback([this.props.startValue[0], this.props.endValue[0]])
                        })}>
                        <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>{'确定'}</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                </View>
            </View>
        }
        return view
    }

    show(callback,from,date) {
        this.callback = callback
        this.from = from
        let selectedValue
        let newDate = [new Date().getFullYear(),(new Date().getMonth() + 1),new Date().getDate()]
        if(isNotEmpty(date)){
            if (this.props.type === 'default'){
                selectedValue = date.split('-')
            } else {
                let start = isNotEmpty(date[0])?date[0].split('-'):newDate
                let end = isNotEmpty(date[1])?date[1].split('-'):newDate
                this.props.startValue[0] = start[0] + '年' + parseInt(start[1]) + '月' +  parseInt(start[2]) + '日'
                this.props.endValue[0] = end[0] + '年' + parseInt(end[1]) + '月' +  parseInt(end[2]) + '日'
                selectedValue = this.props.selectedType[0] === 'start'?start:end
            }
        } else {
            selectedValue = newDate
        }
        this.props.selectedValue[0] = selectedValue[0]+ '年';
        this.props.selectedValue[1] = parseInt(selectedValue[1])+ '月';
        this.props.selectedValue[2] = parseInt(selectedValue[2]) + '日';
        this.setState({ ...this.getDateList() });
        super.show()
    }

    parsStringToSelectedValue(str) {
        let selectedValue = []
        let subIndex = 0
        for(let i = 0; i < this.props.unit.length ;i++){
            let index = str.indexOf(this.props.unit[i])
            let length = this.props.unit[i].length
            selectedValue[i] = str.substring(subIndex,index+length)
            subIndex = index+length
        }
        return selectedValue
    }
}

export default DatePicker;

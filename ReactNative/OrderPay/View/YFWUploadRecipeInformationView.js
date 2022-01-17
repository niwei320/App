import React, {Component} from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity, Platform,
} from 'react-native'
import {yfwOrangeColor,darkNomalColor} from "../../Utils/YFWColor";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWUploadRecipeModel from "../Model/YFWUploadRecipeModel";
import DatePicker from 'react-native-datepicker'
import {formatDateTime, kScreenWidth, onlyNumber, removeEmoji, safe} from "../../PublicModule/Util/YFWPublicFunction";

export default class YFWUploadRecipeInformationView extends Component {

    constructor(props) {
        super(props);
        this.state={
            model:this.props.model,
        };
    }

    componentWillUnmount(){

        this.props.returnModel(this.state.model);

    }

    componentDidMount() {

        this.state.model.date = formatDateTime();

    }

    // ====== Action ======
    _clickChangeGender(gender){

        this.state.model.gender = gender;
        this.setState({
            model:this.state.model,
        });

    }

    _changeTime(time){

        this.state.model.date = time;
        this.setState({
            model:this.state.model,
        });

    }

    _changeText(text,type){

        if (type == '姓名'){

            let nameText = text.replace(removeEmoji, '');
            this.state.model.name = nameText;

        } else if(type == '年龄'){

            let ageText = text.replace(onlyNumber, '');
            this.state.model.age = ageText;

        } else if(type == '医院'){

            let hospitalText = text.replace(removeEmoji, '');
            this.state.model.hospital = hospitalText;

        } else if(type == '科别'){

            let departmentText = text.replace(removeEmoji, '');
            this.state.model.department = departmentText;

        } else if(type == '医生'){

            let doctorText = text.replace(removeEmoji, '');
            this.state.model.doctor = doctorText;

        }

        this.setState({
            model:this.state.model,
        });


    }


    getInfoModel(){

        return this.state.model;

    }


    // ====== View ======
    render() {
        return (
            <View>
                <Text style={{fontSize:12,color:yfwOrangeColor(),padding:15}}>{safe(this.props.prompt_info)}</Text>
                <View style={{height:350}}>
                    {this._renderTextItem('姓名','输入姓名',this.state.model.name)}
                    {this._renderTextItem('年龄','输入年龄',this.state.model.age)}
                    {this._renderGenderItem(this.state.model.gender)}
                    {this._renderTextItem('医院','输入医院',this.state.model.hospital)}
                    {this._renderTextItem('科别','输入科别',this.state.model.department)}
                    {this._renderTextItem('医生','输入医生',this.state.model.doctor)}
                    {this._renderTimeChange('日期','输入日期',this.state.model.date)}
                </View>
            </View>
        )
    }


    _renderTextItem(title,placeholder,value){

        let keyBoard = Platform.OS === 'ios'?'ascii-capable':'default';
        let maxLength = 99;
        if (title == '年龄') {
            keyBoard = Platform.OS === 'ios'?'number-pad':'numeric'
            maxLength = 3;
        }

        return(

            <View style={{height:50}}>
                <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                    <Text style={{marginLeft:15,fontSize:13,color:darkNomalColor()}}>{title} ：</Text>
                    <TextInput style={{marginLeft:15,fontSize:13,width:kScreenWidth - 100,color:darkNomalColor()}}
                               placeholder={placeholder} value={value+''}
                               placeholderTextColor="#999999"
                               keyboardType={keyBoard}
                               returnKeyType={'done'}
                               maxLength={maxLength}
                               underlineColorAndroid={'transparent'}
                               onChangeText={(text)=>{this._changeText(text,title)}}/>
                </View>
                <View style={[BaseStyles.separatorStyle]}/>
            </View>

        );

    }


    _renderGenderItem(value){

        let menImage = require('../../../img/check_number.png');
        let womenImage= require('../../../img/check_number.png');
        if (value == '男'){
            menImage = require('../../../img/check_number_green.png');
        } else if (value == '女'){
            womenImage = require('../../../img/check_number_green.png');
        }

        return(

            <View style={{height:50}}>
                <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                    <Text style={{marginLeft:15,fontSize:13,color:darkNomalColor()}}>性别 ：</Text>
                    <TouchableOpacity style={[BaseStyles.leftCenterView,{width:50,height:50}]}
                                      onPress={()=>{this._clickChangeGender('男')}}>
                        <Image style={{width: 15, height: 15, resizeMode: "contain",marginLeft:15}}
                               source={menImage}/>
                        <Text style={{color:darkNomalColor(),fontSize:13}}>男</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[BaseStyles.leftCenterView,{width:50,height:50}]}
                                      onPress={()=>{this._clickChangeGender('女')}}>
                        <Image style={{width: 15, height: 15, resizeMode: "contain",marginLeft:10}}
                               source={womenImage}/>
                        <Text style={{color:darkNomalColor(),fontSize:13}}>女</Text>
                    </TouchableOpacity>
                </View>
                <View style={[BaseStyles.separatorStyle]}/>
            </View>

        );

    }

    _renderTimeChange(title,placeholder,value){

        if (value.length == 0){
            value = formatDateTime();
        }

        return (
            <View style={{height:50}}>
                <View style={[BaseStyles.leftCenterView,{flex:1}]}>
                    <Text style={{marginLeft:15,fontSize:13,color:darkNomalColor()}}>{title} ：</Text>
                    <DatePicker
                        style={{width:120}}
                        date={value}
                        mode="date"
                        format="YYYY-MM-DD"
                        confirmBtnText="确定"
                        cancelBtnText="取消"
                        showIcon={false}
                        customStyles={{
                            dateInput:{
                                borderWidth:0
                            }
                        }}
                        onDateChange={(datetime) => {this._changeTime(datetime)}}
                    />
                </View>
                <View style={[BaseStyles.separatorStyle]}/>
            </View>

        )
    }




}
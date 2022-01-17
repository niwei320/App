import React, {Component} from 'react';
import {DeviceEventEmitter, Image, Text, TextInput, TouchableOpacity, View,} from 'react-native'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {darkLightColor, darkNomalColor, darkTextColor, yfwGreenColor} from "../../Utils/YFWColor";
import {isNotEmpty, isEmpty, kScreenWidth, mobClick, safe} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import AndroidHeaderBottomLine from "../../widget/AndroidHeaderBottomLine";
import {IDENTITY_CODE} from "../../PublicModule/Util/RuleString";
import YFWToast from "../../Utils/YFWToast";

export default class YFWFaPiaoViewController extends Component {

    static navigationOptions = ({ navigation }) => ({

        tabBarVisible: false,
        title:'填写发票信息',
        headerRight:(
            <View style={{width:40,height:40,marginRight:10}} >
                <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>_this.onRightTvClick()}>
                    <Text style={{color:yfwGreenColor()}}>保存</Text>
                </TouchableOpacity>
            </View>
        ),
    });

    constructor(...args) {
        super(...args);
        _this = this;
        this.state = {
            invoice_code:'',
            invoice_type:'0',
            invoice_title:'',
            invoice_person:new Map(),
            invoice_gongsi:new Map(),
            isShowGongSi:'false',
        };
    }

    onRightTvClick() {
        mobClick('order settlement-invoice-save');
        var data;
        if (this.state.invoice_type == '0'){
            data = {title:'无需发票',code:'',type:'0'};
        } else if (this.state.invoice_type == '1') {

            if (this.refs['titlefield'].props.value.length == 0){
                YFWToast('请输入姓名');
                return;
            }
            if (this.refs['codefield'].props.value.length == 0){
                YFWToast('请输入身份证号');
                return;
            }

            data = {title:this.refs['titlefield'].props.value,code:this.refs['codefield'].props.value,type:'1'};
        }else {
            data = {title:this.refs['titlefield'].props.value,code:this.refs['codefield'].props.value,type:'2'};
        }
        DeviceEventEmitter.emit('FaPiaoBack',data);
        this.props.navigation.pop();
        // this.lostBlur();
    }

    componentDidMount () {
        let data = YFWUserInfoManager.ShareInstance().SystemConfig

        this.setState({
            invoice_type:safe(this.props.navigation.state.params.state.invoiceType),
            isShowGongSi:safe(data.is_show_company_invoice)
        });

        let invoice = this.props.navigation.state.params.state.invoice;
        if (isNotEmpty(invoice) &&
            invoice.title != '请选择' && invoice.type != '0') {
            this.state.invoice_person.title = invoice.title;
            this.state.invoice_person.code = invoice.code;
        } else {

            this._requestFaPiao('1');
            this._requestFaPiao('2');
        }

    }

    _requestFaPiao(type){

        let default_invoice =  this.props.navigation.state.params.state.default;
        let invoice = this.props.navigation.state.params.state.invoice;
        if (invoice == undefined) {

            if (type == '1'){

                let  invoice_person = {
                    title:default_invoice.invoice_applicant,
                    code:default_invoice.invoice_code
                };
                this.setState({
                    invoice_person:invoice_person,
                });
            }

        }

    }
    fapiaoTitle(){
        return this.state.invoice_person.title;

    }
    fapiaoCode(){
        return this.state.invoice_person.code;
    }
    wuxufapiao(){
        mobClick('order settlement-invoice-no');
        this.setState({
            invoice_type:'0',
        });
    }
    woyaofapiao(){
        mobClick('order settlement-invoice-yes');
        this.setState({
            invoice_type:'1'
        });
    }
    gerenClick(){
        this.setState({
            invoice_type:'1'
        });
    }
    gongsiClick(){
        this.setState({
            invoice_type:'2'
        });
    }
    headerView(){
        let color1,color2;
        if (this.state.invoice_type == '0'){
            color1 = yfwGreenColor();
            color2 = darkLightColor();
        } else{
            color1 = darkLightColor();
            color2 = yfwGreenColor();
        }
        return (
            <View style={{height:100,width:kScreenWidth,backgroundColor:'white',flexDirection: 'column'}}>

                <View style={{height:30,width:kScreenWidth,backgroundColor:'white',flexDirection: 'row',marginTop:10,marginLeft:10, alignItems:'center'}}>
                    <Text style={{color:darkTextColor()}} >发票类型</Text>
                </View>

                <View style={{width:kScreenWidth,backgroundColor:'white',flexDirection: 'row',marginLeft:10,marginTop:5,alignItems:'center'}}>
                    <TouchableOpacity activeOpacity={1} onPress={()=>this.wuxufapiao()}>
                        <View style={{width:100,height:40,borderWidth:1,borderColor:color1,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                            {this.state.invoice_type == '0'?<Image style={{width:10,height:8,marginLeft:10}} source={require('../../../img/gou.png')}/>:null}
                            <Text style={{padding:10,color:color1}}>无需发票</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={()=>this.woyaofapiao()}>
                        <View style={{width:100,height:40,borderWidth:1,borderColor:color2,alignItems:'center',justifyContent:'center',marginLeft:10,flexDirection:'row'}}>
                            {this.state.invoice_type != '0'?<Image style={{width:12,height:8,marginLeft:10}} source={require('../../../img/gou.png')}/>:null}
                            <Text style={{padding:10,color:color2}}>我要发票</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );


    }

    bodyView(){
        if (this.state.invoice_type == '0'){

        }else {
            let placeholder1,placeholder2;
            if (this.state.invoice_type == '1'){
                placeholder1 = "请填写您的真实姓名";
                placeholder2 = "请填写您的身份证号码"
            }else {
                placeholder1 = "请填写填写公司名称全称";
                placeholder2 = "请填写统一社会信用代码／纳税人识别号"
            }

            return <View style={{height:150,width:kScreenWidth,backgroundColor:'white',marginTop:10,flexDirection: 'column'}}>
                <View style={{height:40,width:kScreenWidth,backgroundColor:'white',flexDirection: 'row',marginTop:0,marginLeft:10, alignItems:'center'}}>
                    <Text style={{color:darkTextColor(),fontSize:16}} >发票类型</Text>
                </View>
                <View style={{width:kScreenWidth,backgroundColor:'white',flexDirection: 'row',marginLeft:10,marginTop:0,marginBottom:10,alignItems:'center'}}>
                    <TouchableOpacity onPress={()=>this.gerenClick()}>
                        <View style={{height:25,alignItems:'center',flexDirection: 'row'}}>
                            {this.gerenFaPiao()}
                            <Text style={{color:darkNomalColor(),fontSize:14}}>  个人</Text>
                        </View>
                    </TouchableOpacity>
                    {this.ShowGongSi()}
                </View>
                <View style={[BaseStyles.separatorStyle]}/>
                <View style={{height:50,width:kScreenWidth,backgroundColor:'white',flexDirection: 'row', alignItems:'center'}}>
                    <TextInput
                        maxLength={16}
                        underlineColorAndroid='transparent'
                        placeholder={placeholder1}
                        placeholderTextColor="#999999"
                        value={this.fapiaoTitle()}
                        onFocus={()=>{mobClick('order settlement-invoice-name')}}
                        style={{width:kScreenWidth,color:darkTextColor(),fontSize:14,height:30,marginLeft:10,padding:0}}
                        ref={'titlefield'}
                        onChangeText={(text) => {
                            this.state.invoice_person.title = text;
                            this.setState({})
                        }}
                    />
                </View>
                <View style={[BaseStyles.separatorStyle]}/>
                <View style={{height:50,width:kScreenWidth,backgroundColor:'white',flexDirection: 'row', alignItems:'center'}}>
                    <TextInput
                        underlineColorAndroid='transparent'
                        placeholder={placeholder2}
                        placeholderTextColor="#999999"
                        maxLength={18}
                        onFocus={()=>{mobClick('order settlement-invoice-number')}}
                        style={{width:kScreenWidth,color:darkTextColor(),fontSize:14,height:30,marginLeft:10,padding:0}}
                        ref={'codefield'}
                        value={this.fapiaoCode()}
                        onChangeText={(text) => {
                            this.state.invoice_person.code = text.replace(IDENTITY_CODE, '')
                            this.setState({})
                        }}
                    />
                </View>
            </View>
        }
    }

    ShowGongSi(){
        if (this.state.isShowGongSi == 'true'){
            return  <TouchableOpacity onPress={()=>this.gongsiClick()}>
                        <View style={{height:25,width:80,marginLeft:10,alignItems:'center',flexDirection: 'row'}}>
                            {this.gerenFaPiao()}
                            <Text style={{color:darkNomalColor(),fontSize:14}}>  公司</Text>
                        </View>
                    </TouchableOpacity>
        }
    }
    gerenFaPiao(){
        if (this.state.invoice_type == '1'){
            return <Image style={{width:20,height:20,resizeMode:'contain'}} source={ require('../../../img/address_default.png')}/>
        }else {
            return <Image style={{width:20,height:20,resizeMode:'contain'}} source={ require('../../../img/address_normal.png')}/>
        }
    }
    gongsiFaPiao(){
        if (this.state.invoice_type == '2'){
            return <Image style={{width:20,height:20,resizeMode:'contain'}} source={ require('../../../img/address_default.png')}/>
        }else {
            return <Image style={{width:20,height:20,resizeMode:'contain'}} source={ require('../../../img/address_normal.png')}/>
        }
    }
    //View
    render() {
        return (
            <View style={[BaseStyles.container]}>
                <AndroidHeaderBottomLine />
                {this.headerView()}
                {this.bodyView()}
            </View>
        )
    }
}
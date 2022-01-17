import React, {Component} from 'react';
import {
    Dimensions,
    StyleSheet,
    Platform,
    Image,
    TouchableOpacity,
    TextInput,
    Text,
    View, DeviceEventEmitter,
} from 'react-native'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {darkLightColor, darkNomalColor, darkTextColor, separatorColor, yfwOrangeColor,newSeparatorColor} from "../Utils/YFWColor";
import YFWToast from "../Utils/YFWToast";
import YFWCheckButton from '../PublicModule/Widge/YFWCheckButtonView';
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import {
    isEmpty,
    isNotEmpty,
    kScreenWidth,
    safe,
    tcpImage,
    safeObj,
    safeArray
} from "../PublicModule/Util/YFWPublicFunction";
import {pushNavigation} from "../Utils/YFWJumpRouting";
import YFWSwipeRow from '../widget/YFWSwipeRow';
import {toDecimal} from "../Utils/ConvertUtils";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import NumAddSubDialog from "../widget/NumAddSubDialog";
import LinearGradient from 'react-native-linear-gradient';
import YFWMoneyLabel from '../widget/YFWMoneyLabel';



export default class YFWShopCarPackageCellView extends Component {

    static defaultProps = {
        Data:undefined,
        select:false,
    }

    constructor(...args) {
        super(...args);
        this.state = {
            quantity:this.props.Data?.count,
        };

    }

    componentWillReceiveProps(){
        this.state = {
            quantity:this.props.Data?.count,
        };
    }

    // ====== Action ======
    _selectFn(){
        if (this.props.selectFn){
            this.props.selectFn();
        }
    }
    _delFn(){
        if (this.props.delFn){
            this.props.delFn();
        }
    }
    _moveFn(){
        if (this.props.moveFn){
            this.props.moveFn();
        }
    }


    _subtractionFn(){

        var quantity = Number.parseInt(this.state.quantity)-1;
        this._requestUpdateCount(quantity);

    }

    _plusFn(){

        var quantity = Number.parseInt(this.state.quantity)+1;
        if(quantity > this._getPackageReserve()){
            YFWToast('超过库存上限');
            return;
        }
        this._requestUpdateCount(quantity);

    }

    _inputChangeQuantity(text){

        if (isEmpty(text) || text.length == 0){
            this._resetData();
            return;
        }

        var quantity = Number.parseInt(String(text));
        if(quantity > this._getPackageReserve()){
            YFWToast('超过库存上限');
            return;
        }
        this._requestUpdateCount(quantity);

    }

    _getPackageReserve(){

        let reserve = 99999;
        safeArray(this.props.Data?.package_medicines).forEach((item,index,array)=>{
            let item_reserve = Number.parseInt(item.reserve);
            if (reserve > item_reserve) reserve = item_reserve;
        });

        return reserve;
    }

    _getchangeInfo(quantity){

        var changeInfo = 'TC'+this.props.Data?.package_id+','+quantity;

        return changeInfo;
    }


    onChangeText(text){

        var quantity = Number.parseInt(String(text));
        let reserve = this._getPackageReserve();

        // var quantity = Number.parseInt(String(text));
        // if(isNaN(quantity)||quantity<1 || !quantity){
        //     this.setState({quantity:"1"})
        //     return ;
        // }
        if(quantity > reserve){
            this.setState({quantity:String(reserve)});
            return;
        }

        this.setState({quantity:String(text)});

    }

    _resetData(event){

        let quantity = this.props.Data?.count;
        if (this.props.resetData){
            this.props.resetData(quantity+' ');
            setTimeout(()=> {this.props.resetData(quantity);}, 300);
        }

    }



    //跳转商品详情
    _selectGoodsItemMethod(item){

        DeviceEventEmitter.emit('CloseSwipeRow');
        const { navigate } = this.props.navigation;
        pushNavigation(navigate,{type:'get_shop_goods_detail',value:item.shop_goods_id,img_url:tcpImage(item.img_url)})

    }

    //Request
    _requestUpdateCount(quantity){

        if (Number.parseInt(quantity) === 0){

            return;
        }

        if (!YFWUserInfoManager.ShareInstance().hasLogin()) return;
        let paramMap = new Map();
        paramMap.set('__cmd','person.cart.editCart');
        paramMap.set('packageId',Number.parseInt(this.props.Data?.package_id));
        paramMap.set('quantity',Number.parseInt(quantity));
        DeviceEventEmitter.emit('LoadProgressShow')
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            setTimeout(()=> {this.props.changeQuantity(quantity);}, 300);
        },(error)=>{
            if (error&&isNotEmpty(error.code)&&quantity!=1) {
                this._requestUpdateCount(1)
            }
            DeviceEventEmitter.emit('LoadProgressClose');
            YFWToast(safeObj(safeObj(error).msg))
        },false);

    }




    // ====== View =====
    render() {

        let bottomHeight = 50;
        let show_reserve_desc = false;
        if (isNotEmpty(this.props.Data?.reserve_desc) && safeArray(this.props.Data.reserve_desc).length > 0){
            bottomHeight = 70;
            show_reserve_desc = true;
        }

        return (
            <View style={[styles.container,{backgroundColor:'white'}]}>

                <View style={{overflow:'hidden'}}>
                    {this._renderItem()}
                </View>
                <View style={[BaseStyles.leftCenterView,{height:bottomHeight,justifyContent:'space-between'}]}>
                    <View style={[BaseStyles.leftCenterView,{marginLeft:0,flex:1}]}>
                        <View style={{width:30,height:30,marginLeft:10}}>
                            {/* <YFWCheckButton selectFn={()=>this._selectFn()}
                                    select={this.props.select}/> */}
                        </View>
                        {this.renderIdentifyView()}
                        <Text style={{flex:1,marginLeft:11,color:darkNomalColor(),fontSize:12}}>{this.props.Data.package_name}</Text>
                    </View>
                    <View style={{marginRight:0,alignItems:'flex-end',justifyContent:'center'}}>
                        {show_reserve_desc ? <Text style={{fontSize:11,color:yfwOrangeColor(),marginRight:15,marginBottom:5}}>{safe(this.props.Data.reserve_desc)}</Text> : <View/>}
                        <View style={styles.operatingBox}>
                            <TouchableOpacity
                                    hitSlop={{left:0,top:10,bottom:10,right:0}}
                                    activeOpacity={0.8} style={styles.reduce} onPress={()=>this._subtractionFn()}>
                                <View style={styles.reduce}>
                                    <Text allowFontScaling={false} style={this.props.Data.quantity == 1?[styles.btn1, styles.color_disabled1]:styles.btn1}>－</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.reduce}>
                                {this.renderNum()}
                            </View>

                            <TouchableOpacity
                                hitSlop={{left:0,top:10,bottom:10,right:0}}
                                activeOpacity={0.8} style={styles.reduce} onPress={()=>this._plusFn()}>
                                <View style={styles.reduce}>
                                    <Text allowFontScaling={false} style={styles.btn1}>＋</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={{flexDirection:'row-reverse',alignItems:'center',marginBottom:18}}>
                    <View style={{width:9}}/>
                    <YFWMoneyLabel moneyTextStyle={{fontSize:15}} decimalsTextStyle={{fontSize:13}} money={parseFloat(this.props.Data.price)*parseInt(this.state.quantity)}></YFWMoneyLabel>
                    <Text style={{color:'#333',fontSize:12,marginRight:9}}>总价:</Text>
                </View>
                <NumAddSubDialog ref={(item)=>this.numDialog = item} onSureClick={(text)=>{this._inputChangeQuantity(text)}}/>
            </View>
        );
    }

    renderIdentifyView(){
        if (this.props.Data?.type == 'package') {
            return (
                <LinearGradient colors={['rgb(255,136,129)','rgb(234,80,101)']}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                locations={[0,1]}
                                style={{width: 42,height: 15,borderRadius:7,justifyContent:'center',alignItems:'center'}}>
                                <Text style={{fontSize:10,color:'white'}}>套餐</Text>
                </LinearGradient>
            )
        } else {
            return (
                <LinearGradient colors={['rgb(122,219,255)','rgb(72,139,255)']}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                locations={[0,1]}
                                style={{width: 42,height: 15,borderRadius:7,justifyContent:'center',alignItems:'center'}}>
                                <Text style={{fontSize:10,color:'white'}}>多件装</Text>
                </LinearGradient>
            )
        }
    }

    /**
     * 返回输入框样式，android为Text，IOS为TextInput
     * @returns {*}
     */
    renderNum(){
        if(Platform.OS == 'android'){
            return (
                <TouchableOpacity activeOpacity={1}
                                  style={[BaseStyles.centerItem,
                                      {width:30, height:30,borderColor:separatorColor(), borderLeftWidth:1, borderRightWidth:1}]}
                                  onPress={()=>{this.numDialog && this.numDialog.show(this.state.quantity,this._getPackageReserve())}}>
                    <TextInput
                        editable={false}
                        numberOfLines={1} ref={'textInput'}
                        underlineColorAndroid="transparent"
                        style={[styles.btn1,{padding:0,textAlign:'center'}]}>
                        {String(this.state.quantity)}
                        </TextInput>
                </TouchableOpacity>
            )
        }else{
            return (
                <View>
                    <TextInput allowFontScaling={false}
                               ref={'textInput'}
                               style={[styles.btn1,styles.inputBorder]}
                               onSubmitEditing={(event)=>{this._inputChangeQuantity(event.nativeEvent.text);}}
                               onBlur={(event)=>{this._resetData(event)}}
                               value={String(this.state.quantity)}
                               onChangeText={(text)=>{this.onChangeText(text)}}
                               keyboardType= {Platform.OS == 'ios' ? "number-pad" : "numeric"}
                               returnKeyType={'done'}
                               autoFocus={false}
                               underlineColorAndroid="transparent"/>
                </View>
            )
        }
    }

    _renderItem(){
        return (
            <YFWSwipeRow Data={this.props.Data?.package_medicines}
                            accessibilityLabel={this.props.accessibilityLabel}
                            type={this.props.Data?.type}
                            isLast = {false}
                            selectGoodsItemMethod={(badge) => this._selectGoodsItemMethod(badge)}
                            delFn={() => this._delFn()}
                            moveFn={() => this._moveFn()}
                            select={this.props.select}
                            selectFn={()=>this._selectFn()}
                            />
        )
    }


}


const styles = StyleSheet.create({

    container:{
        shadowColor: "rgba(204, 204, 204, 0.2)",
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowRadius: 8,
        shadowOpacity: 1,
        elevation:2,
        borderRadius:8,
        marginHorizontal:13,
        marginTop:7,
        padding:4,
    },
    checkButton:{
        marginLeft:10,
        width:30,
        height:30,
    },
    operatingBox:{

        width:90,
        height:24,
        borderColor:newSeparatorColor(),
        borderWidth:1,
        marginRight:7,
        borderRadius:3,
        flexDirection: 'row',
        overflow:'hidden'

    },
    reduce:{
        flex:1,
        width:30,
        height:24,
        alignItems:'center',
        justifyContent:'center',
    },
    btn1:{
        fontSize:14,
        color:darkTextColor(),
    },
    inputBorder:{
        borderColor:newSeparatorColor(),
        borderLeftWidth:1,
        borderRightWidth:1,
        width:30,
        height:24,
        textAlign:'center',
        padding:0
    },
    color_disabled1:{
        color:darkLightColor(),
    },
    //侧滑菜单的样式
    quickAContent:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-end',
    },
    quick:{
        width:60,
        padding:10,
        justifyContent:'center',
        alignItems:'center'
    }
});

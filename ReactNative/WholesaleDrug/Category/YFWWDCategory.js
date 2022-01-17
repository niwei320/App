import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    NativeModules,
    Platform,
    FlatList,
    DeviceEventEmitter,
} from 'react-native';
import YFWHeaderLeft from "../Widget/YFWHeaderLeft";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import YFWHeaderBackground from "../Widget/YFWHeaderBackground";
import {
    adaptSize,
    isEmpty,
    itemAddKey, kScreenHeight, kScreenWidth,
    kStyleWholesale, mobClick, tcpImage,
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import {Header} from "react-navigation";
import AndroidHeaderBottomLine from "../../widget/AndroidHeaderBottomLine";
import {
    kRoute_category, kRoute_goods_detail,
    kRoute_search,
    kRoute_shop_goods_detail,
    pushWDNavigation
} from "../YFWWDJumpRouting";
import YFWWDCategoryModel from "./Model/YFWWDCategoryModel";
import {YFWImageConst} from "../Images/YFWImageConst";
import YFWWDMore from '../Widget/View/YFWWDMore';
const flatListHeight = kScreenHeight-Header.HEIGHT

const {StatusBarManager} = NativeModules;
export default class YFWWDCategory extends Component {


    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "商品分类",
        headerTitleStyle: {fontSize: 16, color: 'white', textAlign: 'center', flex: 1},
        headerStyle: Platform.OS === 'android' ? {
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0,
        } : {borderBottomColor: 'white',backgroundColor: 'white'},
        headerRight: (
            <View style={BaseStyles.rightCenterView}>
                <YFWWDMore/>
                <TouchableOpacity onPress={()=>{
                    pushWDNavigation(navigation.navigate,{type:kRoute_search});
                }}>
                    <Image style={{width: 18, height: 18, marginRight: 20}}
                           source={YFWImageConst.Btn_bar_search}/>
                </TouchableOpacity>
            </View>
        ),
        headerLeft: <YFWHeaderLeft navigation={navigation}/>,
        headerBackground: <YFWHeaderBackground from={kStyleWholesale}/>,
    });

    constructor(props) {
        super(props)
        let index = 0;//todo:进入初始选中
        if (isEmpty(index)) index = 0;
        this.viewHeight = []
        this.state = {
            data: [],
            index: index,
        };
    }

    componentDidMount() {
        this._requestData();
    }

    //@ Action

    initFlatlistSize(index){
        this.viewHeight = []
        if(this.state.data.length<0){
            return
        }
        this.state.data.forEach((data, i) => {
            this.viewHeight.push(i === index?flatListHeight:0)
        });
        mobClick('home-product-categories-whole' + this.state.data[index].name);
    }

    _pressRow(index) {
        this.initFlatlistSize(index)
        this.setState({
            index: index,
        });

    }

    _pushCategory(item) {
        let {navigate} =  this.props.navigation;
        pushWDNavigation(navigate, {type: kRoute_category, value: item.id, name: item.name});
    }

    _pushSellerList(item) {
        let {navigate} =  this.props.navigation;
        pushWDNavigation(navigate, {type: kRoute_goods_detail, value: item.id, name: item.name});
    }

    //@ View
    render() {

        return (
            <View style={{flex:1,backgroundColor:'white'}}>
                <AndroidHeaderBottomLine/>
                <View style={styles.container}>
                    {this.renderLeftView()}
                    {this.renderRightView()}
                </View>
            </View>
        );
    }

    renderLeftView(){
        let data = this.state.data
        return (
            <FlatList
                style={{height:kScreenHeight-Header.HEIGHT,marginTop:adaptSize(21)}}
                data={data}
                extraData={this.state}
                keyExtractor={(item, index)=>{return index+'leftItem'}}
                renderItem={this._renderLeftItem.bind(this)}
            />
        )
    }

    renderRightView(){
        let data = this.state.data
        return (
            <View style={{height:kScreenHeight-Header.HEIGHT,width:kScreenWidth-adaptSize(98+9),marginLeft:adaptSize(9)}}>
                {data.map((item,index)=>{
                    return (
                        <FlatList
                            key = {'car'+index}
                            style = {{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: kScreenWidth - adaptSize(98 + 9),
                                height: this.viewHeight[index],
                                paddingRight: adaptSize(15)
                            }}
                            data = {data[index] && data[index].categories}
                            extraData = {this.state}
                            keyExtractor={(item, index)=>{return index+'item'}}
                            renderItem = {this._renderItem}
                        />
                    )
                })}
            </View>
        )
    }
    _renderLeftItem({item, index}) {
        let isSelected = this.state.index === index
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>this._pressRow(index)}
                              style={[BaseStyles.centerItem,{flexDirection:'row',alignItems:'center',backgroundColor:'white',height: adaptSize(56),width:adaptSize(98)
                              }]}>
                <View style={{width:adaptSize(6),height:adaptSize(15),backgroundColor:isSelected?'#416dff':'transparent'}}/>
                <View style={{flex:1,alignItems:'center'}}>
                    <Text style={[BaseStyles.titleWordStyle,{fontSize:14,color:isSelected? 'rgb(51,51,51)' : 'rgb(153,153,153)'}]}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        );

    }

    _renderItem = (item)=> {
        let {index} = item
        item = item.item
        return (
            <View style={{paddingBottom:adaptSize(30)}}>
                {index == 0?this.renderHeaderComponent():null}
                <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-between',paddingBottom:adaptSize(15)}}
                                  onPress={()=>{this._pushCategory(item)}} activeOpacity={1}>
                    <Text style={{flex:1,marginLeft:adaptSize(16),fontSize:17,color: "#333333", fontWeight: 'bold'}} numberOfLines={2} >
                        {item.name}
                    </Text>
                    <View style={{width:50,alignItems:'flex-end'}}>
                    <Text style={{fontSize:13,color:'rgb(102,102,102)',marginTop:adaptSize(5)}}>更多</Text>
                    </View>
                </TouchableOpacity>
                <FlatList
                    horizontal={false}
                    numColumns={1}
                    data={item.categories}
                    extraData={this.state}
                    keyExtractor={(item, index)=>{return index+'subItem'}}
                    renderItem={this._renderSubItem.bind(this)}
                />
            </View>
        );
    }

    _renderSubItem({item}) {
        return (
            <TouchableOpacity
                activeOpacity={1}
                style={[BaseStyles.centerItem, {
                    flexDirection:'row',
                    justifyContent: 'flex-start',
                    width:(kScreenWidth-adaptSize(98+9+15))-adaptSize(20),
                    height: adaptSize(99),
                    borderRadius: adaptSize(10),
                    backgroundColor: "#ffffff",
                    paddingBottom:adaptSize(3),
                    marginLeft:adaptSize(16),
                    marginRight:adaptSize(4),
                    marginTop:3,
                    marginBottom:7,
                    shadowColor: "rgba(204, 204, 204, 0.3)",
                    shadowOffset: {
                        width: 0,
                        height: 3
                    },
                    shadowRadius: 13,
                    shadowOpacity: 1,
                    elevation:3,
                }]}
                onPress={()=>this._pushSellerList(item)}
            >
                <View
                    style={{
                        marginLeft:adaptSize(10),
                        borderRadius: adaptSize(3),
                        backgroundColor: "#f5f5f5"
                    }}
                >
                    {item.intro_image?
                        <Image style={{
                            width: adaptSize(72),
                            height: adaptSize(72),
                            resizeMode:'contain'}} source={{uri:tcpImage(item.intro_image)}}
                        />:<></>}
                </View>
                <View
                    style={{
                        marginHorizontal:adaptSize(15),
                        flexDirection:'column',
                        justifyContent:'space-between',
                    }}
                >
                    <Text
                        style={{
                            fontWeight: 'bold',
                            textAlign:"left",
                            width:(kScreenWidth-adaptSize(98+9+15))-adaptSize(20+72+10+30),
                            marginBottom:5,
                            fontSize: 14,
                            color: "#333333",
                            minHeight:adaptSize(30)
                        }}
                        numberOfLines={2}
                        ellipsizeMode={'tail'}
                    >{item.name}</Text>
                    <>
                        <Text numberOfLines={2} style={{width:(kScreenWidth-adaptSize(98+9+15))-adaptSize(20+72+10+30),fontSize: 12, color: "#999999"}}>规格:{item.standard}</Text>
                        <Text numberOfLines={2} style={{width:(kScreenWidth-adaptSize(98+9+15))-adaptSize(20+72+10+30),fontSize: 12, color: "#999999"}}>剂型:{item.standard_type}</Text>
                    </>
                </View>
            </TouchableOpacity>
        )

    }

    renderHeaderComponent(){
        let data = this.state.data
        let adData = []
        if(data.length !== 0){
            adData = data[this.state.index].app_category_ad
        }
        return (
            <View style={{paddingBottom:adaptSize(38),paddingTop:adaptSize(17)}}>
                <TouchableOpacity style={{height:adaptSize(63),borderRadius:10,overflow:'hidden'}} activeOpacity={1} onPress={()=>{
                    this._pushCategory(data&&data[this.state.index])}}>
                    <Image source={{uri:adData[0]&&adData[0].img_url}} style={{resizeMode:'stretch',height:adaptSize(63),width:kScreenWidth-adaptSize(98+9+15)}}/>
                </TouchableOpacity>
            </View>
        )
    }


    //@ Request
    _requestData() {
        //todo:缓存读取
        // let data = YFWWDCategoryModel.getDataArray()
        // if(isNotEmpty(data) && data.length > 0){
        //     this.setState({
        //         data: data
        //     });
        // }else{

            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            // paramMap.set('__cmd', 'store.whole.app.getCategoryList_Whole');
            paramMap.set('__cmd', 'store.whole.app.getCategoryList_Whole_with_medicines');
            DeviceEventEmitter.emit('LoadProgressShow');
            viewModel.TCPRequest(paramMap, (res) => {
                DeviceEventEmitter.emit('LoadProgressClose');
                if(isEmpty(res.result)){
                    return
                }
                let dataArray = YFWWDCategoryModel.getModelArray(res.result);
                dataArray = itemAddKey(dataArray);
                dataArray.forEach((data, i) => {
                    this.viewHeight.push(i === this.state.index?flatListHeight:0)
                });
                this.setState({
                    data: dataArray,
                });
            }, (error) => {
                DeviceEventEmitter.emit('LoadProgressClose');
            }, true);

        // }
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row"
    },
    row: {},
})

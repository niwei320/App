import React, {Component} from 'react';
import {
    FlatList,
    Image, NativeModules,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,SectionList
} from 'react-native';
import {pushNavigation} from "../../Utils/YFWJumpRouting";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {
    darkStatusBar,
    isAndroid,
    isEmpty,
    isIphoneX,
    isNotEmpty,
    itemAddKey,
    kScreenHeight,
    kScreenWidth,
    mobClick,
    adaptSize,
    dismissKeyboard_yfw,
    tcpImage,
    safe,
    iphoneBottomMargin
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../../Utils/YFWRequestViewModel";
import YFWCategoryModel from "../Model/YFWCategoryModel";
import AndroidHeaderBottomLine from '../../widget/AndroidHeaderBottomLine'
import FastImage from 'react-native-fast-image'
import { Header } from 'react-navigation';
import YFWTitleView from '../../PublicModule/Widge/YFWTitleView';
const flatListHeight = kScreenHeight-Header.HEIGHT

const {StatusBarManager} = NativeModules;
export default class YFWCategoryController extends Component {


    static navigationOptions = ({navigation}) => ({
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]}
                              onPress={()=>{
                                  dismissKeyboard_yfw();
                                  navigation.goBack();
                              }}>
                <Image style={{width:11,height:19,resizeMode:'stretch'}}
                       source={ require('../../../img/top_back_white.png')} defaultSource={require('../../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerRight: (
            <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:10}} onPress={()=>{
                pushNavigation(navigation.navigate,{type:'get_search'});
            }}>
                <Image style={{width: 18, height: 18, marginRight: 20}}
                       source={require('../../../img/kind_search_white.png')}/>
            </TouchableOpacity>

        ),
        tabBarVisible: false,
        headerTitle: "商品分类",
        headerTitleStyle: {fontSize: 16, color: 'white', textAlign: 'center', flex: 1},
        headerStyle: Platform.OS == 'android' ? {
            backgroundColor: 'white',
            elevation: 0,
            height: Platform.Version >= 19 ? 50 + StatusBarManager.HEIGHT : 50,
            paddingTop: Platform.Version >= 19 ? StatusBarManager.HEIGHT : 0
        } : {borderBottomColor: 'white',backgroundColor: 'white'},
        headerBackground: <Image source={require('../../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
    });

    constructor(props) {
        super(props)

        let index = this.props.navigation.state.params.state.index;
        if (isEmpty(index)) index = 0;
        this.viewHeight = [flatListHeight, 0, 0, 0, 0, 0];
        this.dataMap = new Map();
        this.state = {
            data: [],
            index: index,
        };
        this.initFlatlistSize(index);
    }

    shouldComponentUpdate(nextProps, nextState) {
        // return nextState.data !== this.state.data;
        return true;
    }

    componentDidMount() {
        darkStatusBar();
        this._requestData();
    }


    //@ Action


    _extraUniqueKey(item, index) {
        return item.id+'';
    }

    initFlatlistSize(index){
        this.viewHeight = []
        for(let i = 0;i<6;i++){
            if(index == i){
                this.viewHeight.push(flatListHeight)
            }else{
                this.viewHeight.push(0)
            }
        }
        if (index == 0) {
            mobClick('home-product-categories-中西药品');
        } else if (index == 1) {
            mobClick('home-product-categories-养生保健');
        } else if (index == 2) {
            mobClick('home-product-categories-医疗器械');
        } else if (index == 3) {
            mobClick('home-product-categories-计生用品');
        } else if (index == 4) {
            mobClick('home-product-categories-中药饮品');
        } else if (index == 5) {
            mobClick('home-product-categories-美容护肤');
        }
    }

    _pressRow(index) {
        this.viewHeight = []
        for(let i = 0;i<6;i++){
            if(index == i){
                this.viewHeight.push(flatListHeight)
            }else{
                this.viewHeight.push(0)
            }
        }
        if (index == 0) {
            mobClick('home-product-categories-中西药品');
        } else if (index == 1) {
            mobClick('home-product-categories-养生保健');
        } else if (index == 2) {
            mobClick('home-product-categories-医疗器械');
        } else if (index == 3) {
            mobClick('home-product-categories-计生用品');
        } else if (index == 4) {
            mobClick('home-product-categories-中药饮品');
        } else if (index == 5) {
            mobClick('home-product-categories-美容护肤');
        }
        this.setState({
            index: index,
        });

    }

    _pushCategory(item) {
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'get_category', value: item.id, name: item.name});
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
                keyExtractor={this._extraUniqueKey.bind(this)}
                renderItem={this._renderLeftItem.bind(this)}
            />
        )
    }

    renderRightView(){
        let data = this.state.data
        let index = this.state.index
        let sections = data[index]&&data[index].categories.map((info,index)=>{
            info.data = info.categories
            info.key = info.id + '-' + index
            info.index = index
            return info
        }) || []
        return (
            <SectionList
                style={{width:kScreenWidth-adaptSize(98+9),backgroundColor:'white',height:this.viewHeight[index]-iphoneBottomMargin(),paddingRight:adaptSize(15),}}
                sections={sections}
                extraData={this.state}
                keyExtractor={this._extraUniqueKey.bind(this)}
                renderItem={this._renderItem}
                renderSectionHeader={(section)=>this._renderSectionHeader(section)}
                stickySectionHeadersEnabled={false}
            />
        )
    }
    _renderLeftItem({item, index}) {

        return (
            <TouchableOpacity activeOpacity={1} onPress={this._pressRow.bind(this, index)}
                style={[BaseStyles.centerItem,{flexDirection:'row',alignItems:'center',backgroundColor:'white',height: adaptSize(56),width:adaptSize(98)
            }]}>
                <View style={{width:adaptSize(6),height:adaptSize(56),backgroundColor:this.state.index == index?'rgb(31,219,155)':'transparent'}}/>
                <View style={{flex:1,alignItems:'center'}}>
                    <Text style={[BaseStyles.titleWordStyle,{fontSize:14,color:this.state.index == index ? 'rgb(51,51,51)' : 'rgb(153,153,153)'}]}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        );

    }

    _renderSectionHeader({section}) {
        let index = section.index
        let item = section
        return (
            <View>
                {index == 0?this.renderHeaderComponent():null}
                <TouchableOpacity style={{flexDirection:'row',justifyContent:'space-between',paddingBottom:adaptSize(15)}}
                    onPress={()=>{this._pushCategory(item)}} activeOpacity={1}>
                    <View style={{marginLeft:adaptSize(16)}}>
                        <YFWTitleView style_title={{fontSize:17,width:adaptSize(22*item.name.length)}} title={item.name}/>
                    </View>
                    <Text style={{fontSize:13,color:'rgb(102,102,102)',marginTop:adaptSize(5)}}>更多</Text>
                </TouchableOpacity>
            </View>
        )

    }

    _renderItem = ({ section, index })=> {
        const  numColumns  = 3;

        if (index % numColumns !== 0) return null;

        const items = [];

        for (let i = index; i < index + numColumns; i++) {
            if (i >= section.data.length) {
                break;
            }
            items.push(this._renderSubItem(section.data[i]));
        }

        return (
            <View style={{flexDirection: "row"}}>
                {items}
            </View>
        );
    }

    _renderSubItem(item) {
        let imageSource = safe(item.intro_image).includes('gif')?item.intro_image:tcpImage(item.intro_image)
        return (
            <TouchableOpacity key={item.id+'s'} activeOpacity={1} style={[BaseStyles.centerItem,{width:(kScreenWidth-adaptSize(98+9+15))/3,height:adaptSize(104)}]}
                              onPress={()=>this._pushCategory(item)}>
                    <FastImage style={{height: adaptSize(60), width:adaptSize(60)}} source={{uri: imageSource}}/>
                <Text style={[BaseStyles.titleWordStyle,{textAlign:"center",width:(kScreenWidth-adaptSize(98+9+15))/3,marginTop:5,marginBottom:5,fontSize:13,color:'rgb(102,102,102)'}]}>{item.name}</Text>
            </TouchableOpacity>
        );

    }

    renderHeaderComponent(){
        let data = this.state.data
        let adData = []
        if(data.length != 0){
           adData = data[this.state.index].app_category_ad
        }
        return (
            <View style={{paddingBottom:adaptSize(38),paddingTop:adaptSize(17)}}>
                <TouchableOpacity style={{height:adaptSize(63),borderRadius:10,overflow:'hidden'}} activeOpacity={1} onPress={()=>{
                    this._pushCategory(data&&data[this.state.index])}}>
                        <FastImage source={{uri:adData[0]&&adData[0].img_url}} defaultSource={{uri:adData[0]&&adData[0].img_url}} resizeMode={'stretch'} style={{height:adaptSize(63),width:kScreenWidth-adaptSize(98+9+15)}}/>
                </TouchableOpacity>
            </View>
        )
    }


    //@ Request
    _requestData() {
        let data = YFWCategoryModel.getDataArray()
        if(isNotEmpty(data) && data.length > 0){
            this.setState({
                data: data
            });
        }else{

            let paramMap = new Map();
            let viewModel = new YFWRequestViewModel();
            paramMap.set('__cmd', 'guest.category.getCategoryList');
            viewModel.TCPRequest(paramMap, (res)=> {
                let dataArray = YFWCategoryModel.getModelArray(res.result);
                dataArray = itemAddKey(dataArray);
                this.setState({
                    data: dataArray,
                });
            }, (error)=> {
            }, true);

        }
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row"
    },
    row: {},
})
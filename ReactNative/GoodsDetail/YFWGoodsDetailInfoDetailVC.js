import React, {Component} from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList
} from 'react-native';
import {
    backGroundColor,
    darkLightColor,
    darkNomalColor,
    darkTextColor,
    separatorColor,
    yfwGreenColor,
    yfwOrangeColor,
    orangeColor
} from '../Utils/YFWColor'
import YFWRequestViewModel from '../Utils/YFWRequestViewModel'
import {pushNavigation} from "../Utils/YFWJumpRouting";
import {
    isAndroid,
    isEmpty, isNotEmpty,
    kScreenWidth,
    safe, safeObj, tcpImage,
} from "../PublicModule/Util/YFWPublicFunction";
import YFWNativeManager from "../Utils/YFWNativeManager";
import YFWGoodsDetailInfoDetailViewModel from './YFWGoodsDetailInfoDetailViewModel'
import YFWTitleView from '../PublicModule/Widge/YFWTitleView'
import FastImage from 'react-native-fast-image';

export default class YFWGoodsDetailInfoDetailVC extends Component {

    static defaultProps = {
        data:undefined,
    }

    constructor(...args) {
        super(...args);
        this.state = {
            detailViewModel : [],
            notice: undefined,
            dataSource: []
        };
    }

    componentWillReceiveProps(newProps){
        // this.props = props
        //这里只判断goods_id是没有问题的，可能有些请求使用shop_id或者其他的，但是都是一个对象里的
        if (isNotEmpty(safeObj(this.props.data).goods_id) && this.firstRequest != true){
            this.firstRequest = true
            this.fetchAllDataFromServer()

        }

        if(this.state.detailViewModel.length>0) {
            this.setState({
                dataSource: this.state.detailViewModel[newProps.selectIndex].items,
                notice: this.state.detailViewModel[newProps.selectIndex].notice
            })
        }
    }

    fetchAllDataFromServer(){
        let paramMap = new Map();
        let cmd = 'guest.common.app.getAPPBannerBottom as getAPPBannerBottom,guest.shop.getShopQualification as getShopQualification'
        //大家浏览
        paramMap.set('getAPPBannerBottom')
        //商家资质
        paramMap.set('getShopQualification',{'storeid':safeObj(this.props.data).shop_id})

        paramMap.set('__cmd', cmd)
        let viewModel = new YFWRequestViewModel();

        viewModel.TCPRequest(paramMap,(res)=>{

            let model = YFWGoodsDetailInfoDetailViewModel.getModelArray(safeObj(this.props.data), safeObj(res.result))
            this.setState({
                dataSource: model[this.props.selectIndex].items,
                detailViewModel: model,
                notice: model[this.props.selectIndex].notice
            })
        },()=>{},false)

    }

    render() {
        return (
            <View style={{flex:1 , backgroundColor:backGroundColor()}}>
                {/* <ScrollView style={[{flex:1}]}> */}
                    {/* {this._renderHeaderTab()} */}
                    {/* {this._renderNoticeView()} */}
                    {this._renderContentFlatlist()}
                {/* </ScrollView> */}
            </View>
        );
    }

    /** 基本信息、说明书、服务保障 */
    _renderHeaderTab() {
        return (
            <View style={{flex:1, height:50,backgroundColor:'#fff',justifyContent:'space-evenly', alignItems:'center', flexDirection:'row', paddingBottom:5}}>
                {this._renderHeaderTabItem()}
            </View>
        )
    }

    _renderHeaderTabItem() {
        let items = []
        for (let index = 0; index < this.state.detailViewModel.length; index++) {
            const element = this.state.detailViewModel[index];
            items.push(
                <TouchableOpacity key={index+'tab'} activeOpacity={1} style={{justifyContent:'center', alignItems:'center'}} onPress={()=> {this._changeIndex(index)}}>
                    <YFWTitleView type='tab' title={element.name} style_title={{width:element.name.length==4 ? 70 : 55,fontSize:15}} hiddenBgImage={this.props.selectIndex != index}/>
                </TouchableOpacity>
            )
        }
        return items
    }

    /** 基本信息、说明书提示 */
    _renderNoticeView() {
        let notice = this.state.notice
        if(isNotEmpty(notice)){
            return(
                <View style={{padding:13, backgroundColor: "#faf8dc"}}>
                    <Text style={{fontSize:12,color:orangeColor(),flex:1}}>{notice.content}</Text>
                </View>
            )
        }else{
            return <View/>
        }
    }

    _renderContentFlatlist() {
        return(
            <FlatList
                removeClippedSubviews
                style={{flex:1}}
                data={this.state.dataSource}
                renderItem={this._renderCell.bind(this)}
            />
        )
    }

    /** 渲染cell */
    _renderCell({item}) {
        return(
            <View style={{flex:1}}>
                {item.title ?
                    <View style={{flex:1,paddingTop:18, paddingBottom:10, marginHorizontal: 13}}>
                        <Text style={{color:darkTextColor(), fontSize:13, fontWeight:'bold'}}>{item.title}</Text>
                    </View> : null}
                <FlatList
                    removeClippedSubviews
                    style={item.isRadius ? [styles.contentRadius, {flex:1, paddingTop:15}] : {flex:1}}
                    data={item.items}
                    renderItem={this._renderItemCell.bind(this)}
                    numColumns={item.numColumns}
                />
            </View>
        )
    }

    _renderItemCell(item) {
        let model = item.item

        if (model.cell == 'YFWGoodsDetailsDescriptionCell') {
            return this._renderDescriptionCell(item)

        }else if (model.cell == 'YFWGoodsDetailsAptitudeCell') {
            return this._renderAptitudeCell(item)

        }else if (model.cell == 'YFWGoodsDetailsNormalCell') {
            return this._renderNormalCell(item)

        }else if (model.cell == 'YFWGoodsDetailsImageCell') {
            return this._renderImageCell(item)

        }else if (model.cell == 'YFWGoodsDetailsPubImageCell') {
            return this._renderPubImageCell(item)

        }else if (model.cell == 'YFWGoodsDetailsAptitudeImageCell') {
            return this._renderAptitudeImageCell(item)

        }else if (model.cell == 'YFWGoodsDetailsDescriptionLineCell') {
            return this._renderDescriptionLineCell(item)

        }else if (model.cell == 'YFWGoodsDetailsDescriptionPointCell') {
            return this._renderDescriptionPointCell(item)

        }else {
            return <View/>
        }
    }

    /** 描述性cell 上方粗体标题、下方中黑文字 */
    _renderDescriptionCell(item) {
        let model = item.item

        return (
            <View style={{flex:1, paddingHorizontal:15}}>
                <View style={{flexDirection:'row', paddingBottom:8,alignItems:'center'}}>
                    {model.icon ? <Image source={model.icon} style={{width:15, height:15, marginRight:3, resizeMode:'contain'}}/> : null}
                    <Text style={{flex:1,color:darkTextColor(), fontSize:12, fontWeight:'bold'}}>{model.title}</Text>
                </View>
                <View style={{flex:1,paddingBottom:15}}>
                    <Text style={{color:darkNomalColor(), fontSize:12, lineHeight:17}}>{model.content}</Text>
                </View>
            </View>
        )
    }

    /** 平台资质cell */
    _renderAptitudeCell(item) {
        let model = item.item

        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {this._platAptitudeClick(model)}} style={{overflow:'hidden',borderBottomLeftRadius:7,borderBottomRightRadius:7}}>
                <Image source={{uri:model.icon}} style={{width:kScreenWidth, height:70/375.0*kScreenWidth, resizeMode:'stretch'}}/>
            </TouchableOpacity>
        )
    }

    /** 普通cell 左边浅黑标题、右边黑色副标题 */
    _renderNormalCell(item) {
        let model = item.item

        return (
            <View style={{flex:1, flexDirection:'row', alignItems:'center', paddingHorizontal:15, paddingBottom:15}}>
                <Text style={{width:70, color:darkLightColor(), fontSize:12}}>{model.title}</Text>
                <Text style={{flex:1, color:darkTextColor(), fontSize:12}}>{model.subtitle}</Text>
            </View>
        )
    }

    /** 图片cell  */
    _renderImageCell(item) {
        let model = item.item

        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {this._clickShopImages(item,true)}} style={[styles.contentRadius,{flex:1, padding:model.padding, paddingTop:model.padding-15, alignItems:'center', justifyContent:'center',marginTop:10, marginHorizontal: 13}]}>
                <Image source={{uri:model.image_url}} style={{width:model.width, height:model.height, resizeMode:'contain'}} resizeMethod={'resize'}/>
            </TouchableOpacity>
        )
    }

    /** pub图片cell  */
    _renderPubImageCell(item) {
        let model = item.item

        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {this._clickShopImages(item,true)}}>
                <FastImage
                    source={{uri:model.image_url}}
                    style={{width:model.width, height:model.height, opacity:isAndroid()?model.opacity:undefined}}
                    resizeMode={FastImage.resizeMode.stretch}
                    onLoad={ e => {
                        if (model.onLoad == 0) {
                            const size = e.nativeEvent
                            model.height = kScreenWidth * size.height / size.width
                            model.width = kScreenWidth
                            model.onLoad = 1
                            model.opacity = 1
                            this.setState()
                        }
                    }}
                />
            </TouchableOpacity>
        )
    }

    /** 图片带文字的cell  */
    _renderAptitudeImageCell(item) {
        let model = item.item

        return (
            <TouchableOpacity activeOpacity={1} onPress={() => {this._clickShopImages(item,true)}} style={[styles.contentRadius,{width:(kScreenWidth-36)/2, backgroundColor:'#fff',marginBottom:10, marginLeft:item.index%2==0 ? 13 : 10, paddingTop:10, alignItems:'center', justifyContent:'center'}]}>
                <Image source={{uri:(safe(model.image_url))}} style={{width:133/375.0*kScreenWidth, height:133/375.0*kScreenWidth, resizeMode:'contain'}} resizeMethod={'resize'}/>
                <Text style={{marginHorizontal:15, paddingBottom:15, color:darkTextColor(), fontSize:12}} numberOfLines={1}>{model.image_name}</Text>
            </TouchableOpacity>
        )
    }

    /** 描述性cell 上方黑色标题、下方左边带点颜色描述 */
    _renderDescriptionPointCell(item) {
        let model = item.item

        return (
            <View style={{flex:1, paddingHorizontal:15}}>
                <Text style={{flex:1,color:darkTextColor(), fontSize:12, fontWeight:'bold', paddingBottom:8}}>{model.title}</Text>
                <View style={{flex:1, paddingBottom:15}}>
                    {this._renderDescriptionPointItemView(model)}
                </View>
            </View>
        )
    }

    _renderDescriptionPointItemView(model) {
        let items = []
        for (let index = 0; index < model.items.length; index++) {
            const element = model.items[index];
            items.push(
                <View key={index+'c'} style={{flex:1, justifyContent:'flex-start', alignItems:'flex-start', flexDirection:'row'}}>
                    <View style={{width:6,height:6,backgroundColor:index%2==0 ? yfwOrangeColor(): yfwGreenColor(), marginTop:6, marginRight:5, borderRadius:3}}></View>
                    <Text style={{flex:1, color:darkNomalColor(), fontSize:12, lineHeight:17}}>{element}</Text>
                </View>
            )
        }
        return items
    }

    /** 描述性cell 上方黑色标题、下方左边带点颜色、竖线描述 */
    _renderDescriptionLineCell(item) {
        let model = item.item

        return (
            <View style={{flex:1, paddingHorizontal:15}}>
                <Text style={{flex:1,color:darkTextColor(), fontSize:12, fontWeight:'bold', paddingBottom:8}}>{model.title}</Text>
                <View style={{flex:1, paddingBottom:15}}>
                    {this._renderDescriptionLineItemView(model)}
                </View>
            </View>
        )
    }

    _renderDescriptionLineItemView(model) {
        let items = []
        for (let index = 0; index < model.items.length; index++) {
            const element = model.items[index];
            items.push(
                <View key={index+'v'} style={{flex:1, justifyContent:'flex-start', alignItems:'flex-start', flexDirection:'row'}}>
                    <View style={{justifyContent:'center',alignItems:'center',marginRight:5,}}>
                        <View style={{width:1, height:4, backgroundColor:index==0 ? '#fff' : '#dddddd'}}></View>
                        <View style={{width:6, height:6, backgroundColor:yfwGreenColor(), marginVertical:2, borderRadius:3}}></View>
                        <View style={{width:1, flex:1, backgroundColor:index==model.items.length-1 ? '#fff' : '#dddddd'}}></View>
                    </View>
                    <Text style={{flex:1, color:darkNomalColor(), fontSize:12, lineHeight:17}}>{element}</Text>
                </View>
            )
        }
        return items
    }

    /** 平台资质证书查看 */
    _platAptitudeClick(model) {
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {
            type: 'get_h5',
            value: model.link,
            name: '资质证书',
            title: '资质证书',
            isHiddenShare:true,
        });
    }

    /** 点击商家资质、实景 */
    _clickShopImages(item,showStatus) {
        if(item.item.navigationImages&&item.item.navigationImages.length>0){
            let {navigate} = this.props.navigation;
            pushNavigation(navigate,{type:'big_picture',value:{imgs:item.item.navigationImages,index:item.index,notShowTip:showStatus}})
        }
    }

   // # Method #
    _changeIndex(index){
        let data = this.state.detailViewModel[index]
        if(index==0){
            YFWNativeManager.mobClick('product detail-details-info')
        }
        this.setState({
            dataSource: data.items,
            notice: data.notice
        });
    }

}

const styles = StyleSheet.create({
    contentRadius: {
        borderRadius: 7,
        backgroundColor: "#ffffff",
        shadowColor: "rgba(206, 206, 206, 0.28)",
        shadowOffset: {
            width: 1,
            height: 1
        },
        shadowRadius: 4,
        shadowOpacity: 1
    }
});

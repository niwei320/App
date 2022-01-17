
import React,{Component}  from 'react';

import {
    View,
    TouchableOpacity,
    Text,
    Modal,
    FlatList,
    Image,ScrollView
} from 'react-native';
import {
    iphoneBottomMargin,
    isIphoneX,
    itemAddKey,
    kScreenHeight,
    kScreenWidth,
    isAndroid,
    convertShopImage
} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {yfwGreenColor} from "../Utils/YFWColor";
import {pushNavigation} from "../Utils/YFWJumpRouting";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWEmptyView from './YFWEmptyView';


export default class YFWQualificationView extends Component{

    constructor(...args){
        super(...args);
        this.state = {
            data:[],
            QualificationData:[],
            ShopLiveData:[],
            showView:false,
            clickIndex:0,
            scrollIndex:0,
        }
    }
    dissMissView(){
        this.props.dismiss&&this.props.dismiss()
        this.setState({
            showView:false,
        })
    }
    showView(qData,shopliveData){
        qData = itemAddKey(qData);
        this.setState({
            showView:true,
            data:qData,
            QualificationData:qData,
            ShopLiveData:shopliveData,
            clickIndex:0,
        })
    }
    showAnother(isZizhi){
        let newData = isZizhi?this.state.QualificationData:this.state.ShopLiveData;
        if (this.state.data.length >0 && newData.length > 0) {
            if (isAndroid()) {
                this.listView&&this.listView.scrollTo({x:0,y:0,animated:true})
            } else {
                this.listView&&this.listView.scrollToIndex({viewPosition: 0, index: 0});
            }
        }
        let newIndex = isZizhi?0:1;
        let newScrollIndex = newData.length == 0?0:this.state.scrollIndex;
        if (isAndroid()) {
            newScrollIndex = 0
        }
        newData = itemAddKey(newData);
        this.setState({
            data:newData,
            clickIndex:newIndex,
            scrollIndex:newScrollIndex,
        })
    }
    render(){

        return (
            <Modal animationType='slide'
                   transparent={true}
                   visible={this.state.showView}
                   onRequestClose={() => {
                       this.dissMissView()
                   }}>
                {this.renderAlertView()}
            </Modal>
        )
    }
    colorBar(index){
        if (this.state.clickIndex == index){
            return <View style={{backgroundColor:yfwGreenColor(),marginBottom:1,width:50,height:3}}/>
        } else {
            return <View style={{marginBottom:1,height:3,width:1}}/>
        }
    }
    leftArrow(){
        if (this.state.scrollIndex==0){
            return (<View style={{width:30,height:30}}/>)
        } else {
            return (
                <TouchableOpacity activeOpacity={1} onPress={()=>this.preView()}>
                    <Image style={{resizeMode:'contain',width:18,height:30}} source={require('../../img/arrow_left.png')} resizeMethod={'resize'}/>
                </TouchableOpacity>
            )
        }
    }
    rightArrow(){
        if (this.state.scrollIndex >= this.state.data.length - 1){
            return (<View style={{width:30,height:30}}/>)
        } else {
            return (
                <TouchableOpacity activeOpacity={1} onPress={()=>this.nextView()}>
                    <Image style={{resizeMode:'contain',width:18,height:30}} source={require('../../img/arrow_right.png')} resizeMethod={'resize'}/>
                </TouchableOpacity>
            )
        }
    }
    changeScrollIndex(e) {
        var offsetX = e.nativeEvent.contentOffset.x;
        let width = parseInt(kScreenWidth - 80);
        var currentPage = Math.floor(offsetX / width);
        if (currentPage < 0) {
            currentPage = 0;
            if (isAndroid()) {
                this.listView&&this.listView.scrollTo({x:0,y:0,animated:true})
            } else {
                this.listView&&this.listView.scrollToIndex({viewPosition: 0, index: 0});
            }
        }
        this.setState({
            scrollIndex:currentPage,
        })
    }
    preView() {
        if (this.state.scrollIndex < 1){
            return;
        }
        if (isAndroid()) {
            this.listView&&this.listView.scrollTo({x: (this.state.scrollIndex - 1)*(kScreenWidth-80), y: 0, animated: true})
            this.setState({
                scrollIndex:this.state.scrollIndex - 1,
            })
        } else {
            this.listView&&this.listView.scrollToIndex({viewPosition: 0, index: this.state.scrollIndex - 1});
        }
    }
    nextView() {
        if (this.state.scrollIndex >= this.state.data.length - 1) {
            return;
        }
        if (isAndroid()) {
            this.listView&&this.listView.scrollTo({x: (this.state.scrollIndex + 1)*(kScreenWidth-80), y: 0, animated: true})
            this.setState({
                scrollIndex:this.state.scrollIndex + 1,
            })
        } else {
            this.listView&&this.listView.scrollToIndex({viewPosition: 0, index: this.state.scrollIndex + 1});
        }
    }
    renderTopTitleView(isZizhi){
        let title = isZizhi?'商家资质':'店铺实景';
        let value = isZizhi?0:1;
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>this.showAnother(isZizhi)}>
                <View style={[{width:80,height:40,flex:1}]}>
                    <View style={[BaseStyles.centerItem,{flex:1}]}>
                        <Text style={{fontSize:14,color:'black',marginTop:20}}>{title}</Text>
                    </View>
                    <View style={[BaseStyles.centerItem,{height:3}]}>
                        {this.colorBar(value)}
                    </View>

                </View>
            </TouchableOpacity>
        )


    }
    renderAlertView(){
        const bottom = iphoneBottomMargin();
        this.imgs = []
        for (let i = 0; i < this.state.data.length; i++) {
            this.imgs.push(convertShopImage(this.state.data[i].show_image_suffix,this.state.data[i].image_file))
        }
        return (
            <View style={{flex:1}}>
                <TouchableOpacity style={{flex:1}}activeOpacity={1} onPress={()=>this.dissMissView()}/>
                <View style={{width:kScreenWidth,height:kScreenHeight/2,backgroundColor:'white'}}>
                    <View style={{height:50,width:kScreenWidth,flexDirection:'row',justifyContent:'center'}}>
                        {this.renderTopTitleView(true)}
                        {this.renderTopTitleView(false)}
                    </View>
                    <View style={{width:kScreenWidth,flex:1,flexDirection:'row',justifyContent:'center'}}>

                        <View style={[BaseStyles.centerItem, {height:kScreenHeight/2-90,width:40}]}>
                            {this.leftArrow()}
                        </View>
                        {this.renderListView()}
                        <View style={[BaseStyles.centerItem, {height:kScreenHeight/2-90,width:40}]}>
                            {this.rightArrow()}
                        </View>
                    </View>
                    <TouchableOpacity activeOpacity={1} onPress={()=>this.dissMissView()}>
                        <View style={[BaseStyles.centerItem,{width:kScreenWidth,height:40,backgroundColor:yfwGreenColor(),marginBottom:bottom}]}>
                            <Text style={{color:'white',fontSize:14}}>{'关闭'}</Text>
                        </View>
                    </TouchableOpacity>

                </View>

            </View>
        )
    }
    renderListView() {
        if (isAndroid()) {
            if (this.imgs.length == 0) {
                return this.renderEmptyView()
            }
            return (
                <ScrollView pagingEnabled={true}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    ref={(view)=>{this.listView = view}}
                    onMomentumScrollEnd={(e)=>this.changeScrollIndex(e)}>
                    {this.imgs.map((item,index)=>{
                        return this.renderCollItem({item:item,index:index})
                    })}
                </ScrollView>
            )
        }
        return (
            <FlatList ref={(view)=>{this.listView = view}}
                    data={this.imgs}
                    renderItem={this.renderCollItem}
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={this.renderEmptyView()}
                    onMomentumScrollEnd={(e)=>this.changeScrollIndex(e)}>
            </FlatList>
        )
    }
    renderEmptyView(){
        return (
            <View style={{width:kScreenWidth-80,paddingTop:80,flexDirection:'row',justifyContent:'center'}}>
                <YFWEmptyView image={require('../../img/ic_no_quality.png')} title={this.state.selectedIndex == 0?'暂无资质图片':'暂无实景图片'} bgColor={'transparent'}/>
            </View>
        )
    }
    renderCollItem = (item) => {
            let imageW = kScreenWidth - 80;
            let imageH = kScreenHeight/2 - 100;
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>{
                this.dissMissView()
                let {navigate} = this.props.navigation
                pushNavigation(navigate,{type:'big_picture',value:{imgs:this.imgs,index:item.index,notShowTip:true}})
            }}>
                <Image style={{resizeMode:'contain',width:imageW,height:imageH,marginTop:10}} source={{uri:item.item}}/>
            </TouchableOpacity>
        )
    }

}

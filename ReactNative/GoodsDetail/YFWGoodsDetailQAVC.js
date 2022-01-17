import React from 'react'
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList, ScrollView, DeviceEventEmitter
} from 'react-native'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {separatorColor,backGroundColor} from "../Utils/YFWColor";
import {
    isEmpty,
    isNotEmpty,
    itemAddKey,
    kScreenWidth, safeObj,
    strMapToObj
} from "../PublicModule/Util/YFWPublicFunction";
import YFWRequestViewModel from "../Utils/YFWRequestViewModel";
import YFWUserInfoManager from "../Utils/YFWUserInfoManager";
import YFWShopDetailGoodsListModel from "../FindYao/Model/YFWShopDetailGoodsListModel";
import YFWGoodsDetailQAModel from "./Model/YFWGoodsDetailQAModel";
import YFWTitleView from '../PublicModule/Widge/YFWTitleView';


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
/**
 * 商品详情问答
 */
export default class YFWGoodsDetailQAVC extends React.Component {

    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: "全部问题",
        headerTitleStyle: {fontSize: 16, color: 'white', textAlign: 'center', flex: 1},
        headerRight: <View style={{width:50}}/>,
        headerLeft: (
            <TouchableOpacity style={[BaseStyles.item,{width:50,height:40}]} onPress={()=>navigation.state.params.backMethod()}>
                <Image style={{width:10,height:16,resizeMode:'stretch'}} source={require('../../img/top_back_white.png')}/>
            </TouchableOpacity>
        ),
        headerBackground: <Image source={require('../../img/Status_bar.png')} style={{width:kScreenWidth, flex:1, resizeMode:'stretch'}}/>
    });


    constructor(props) {
        super(props)
        this.state = {
            list: null,
            selectIndex:0
        }
    }
    componentWillMount(){
        this.props.navigation.setParams({ backMethod:this._backMethod });
    }
    _backMethod=()=>{
        this.props.navigation.goBack();

    }
    componentDidMount() {
        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.medicine.getQuestionAskList');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res) => {
            let dataArray = YFWGoodsDetailQAModel.getModelArray(res.result)
            safeObj(dataArray)[0].isSelect = true
            this.setState({
                list: dataArray
            })
        });
    }

    render() {
        if (isNotEmpty(this.state.list)) {
            this.dataArray = itemAddKey(this.state.list[this.state.selectIndex].ask_items)
        }
        return (
            <View style = {{flex: 1,backgroundColor:'rgb(250,250,250)'}}>
                <View style = {[BaseStyles.sectionListStyle, {backgroundColor:'rgb(250,250,250)',paddingHorizontal:10}]}>
                    {this._renderScrollTabs()}
                </View>
                <View style = {{width: width, height: 10}}/>
                <FlatList
                    renderItem = {this._renderQaItem}
                    ItemSeparatorComponent={this._splitView}
                    data = {this.dataArray}
                    keyExtractor = {(item, index) => item.key}
                />
            </View>
        )
    }

    _renderScrollTabs() {
        if (isNotEmpty(this.state.list)) {
            let views = []
            this.state.list.map((item,index)=>{
                views.push(
                    <TouchableOpacity style={{marginLeft:index==0?0:7,marginRight:7}} activeOpacity={1}  onPress={()=>{this.clickedIndex(index)}} >
                        <YFWTitleView type='tab' style_title={{width:80,fontSize:15,fontWeight:'500'}} title={item.type_name} hiddenBgImage={this.state.selectIndex != index}/>
                    </TouchableOpacity>
                )
            })

            return(
                <ScrollView onLayout={(event)=>{
                    if (this.props.onLayout) {
                        this.props.onLayout(event)
                    }
                }} style={[{height:51,backgroundColor:backGroundColor()}]}
                keyboardShouldPersistTaps={'always'}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{alignItems:'center',marginHorizontal:6}} >
                    {views}
                </ScrollView>
            );
        }

    }

    clickedIndex(index){
        this.state.selectIndex = index
        this.setState({})
    }

    _renderQaItem = (item) => {
        return (
            <View style = {{marginLeft:10,width:kScreenWidth-20,paddingVertical:30,backgroundColor:'white',borderRadius:10}}>
                <View style={{flexDirection:'row',marginLeft:24,marginRight:37}}>
                    <Image source={require('../../img/pic_question.png')} style={{width:16,height:16,resizeMode:'stretch'}}/>
                    <Text style = {{color:'rgb(51,51,51)',marginLeft:8,fontSize: 15,fontWeight:'500'}}>{item.item.title}</Text>
                </View>
                <View style={{flexDirection:'row',marginTop:18,marginLeft:24,marginRight:37}}>
                    <Image source={require('../../img/pic_answer.png')} style={{width:16,height:16,resizeMode:'stretch'}}/>
                    <Text style = {{color:'rgb(51,51,51)',marginLeft:8,fontSize: 13,lineHeight:18}}>{item.item.content}</Text>
                </View>
            </View>
        )
    }

    _splitView() {
        return (
            <View style={{width:width}} height={10}/>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        marginTop:5,
        marginBottom: 10,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        borderRadius: 20,
    }
})
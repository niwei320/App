import React, {Component} from 'react';
import {
    Platform,
    View,
    FlatList,
    TextInput,
    Image,
    Text,
    TouchableOpacity,
} from 'react-native';
import {
    itemAddKey,
    isEmpty,
    kScreenWidth,
    isNotEmpty,
    safeObj
} from "../../../PublicModule/Util/YFWPublicFunction";
import {yfwGreenColor} from '../../../Utils/YFWColor'
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWHealthAskQuestionItemView from '../View/YFWHealthAskQuestionItemView'
import YFWListFooterComponent from '../../../PublicModule/Widge/YFWListFooterComponent'
import AndroidHeaderBottomLine from "../../../widget/AndroidHeaderBottomLine";
import YFWHealthAskCategoryQuestionModel from "../Model/YFWHealthAskCategoryQuestionModel";


export default class YFWHealthAskAllQuestionController extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        title:'全部问题'
    });


    constructor(props, context) {

        super(props, context);

        this.state = {
            categoryData:[],
            dataArray:[],
            pageIndex:1,
            loading:false,
            showFoot:2,
            allHeader:false,
        }
    }

    componentDidMount(){

        this._handleData();

    }

    //@ Action

    _changeHeaderStateMethod(){

        this.setState({
            allHeader : !this.state.allHeader,
        });

    }

    _clickCategoryItemMethod(badge){

        const { navigate } = this.props.navigation;
        pushNavigation(navigate,{type:'get_ASK_all_category', categoryid:badge.dep_id , title:badge.dep_name , py_name:badge.py_name});

    }


    _onRefresh(){

        this.state.pageIndex = 1;
        this.setState({
            loading:true
        });
        this._handleData();

    }

    _onEndReached(){

        if(this.state.showFoot != 0 ){
            return ;
        }
        this.state.pageIndex ++;
        this.setState({
            showFoot:2
        });
        this._handleData();

    }



    //@Request
    _handleData(){

        if(safeObj(this.state.categoryData).length > 0){
            this.requestAllAsk()
        }else{
            this.requestClassify()
        }

    }

    /**
     * 请求所有问题
     */
    requestAllAsk(){
        let paramMap = new Map();
        paramMap.set('__cmd' , 'guest.ask.getPageData');
        paramMap.set('pageSize' , 20);
        paramMap.set('pageIndex' , this.state.pageIndex);
        paramMap.set('py' , "");
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            let showFoot = 0;
            let questionArray = YFWHealthAskCategoryQuestionModel.getQuestionArray(res.result.dataList);

            if (questionArray.length === 0){
                showFoot = 1;
            }
            if (this.state.pageIndex > 1){
                questionArray = this.state.dataArray.concat(questionArray);
            }
            questionArray = itemAddKey(questionArray);
            this.setState({
                dataArray:questionArray,
                showFoot:showFoot,
            });
        },(error)=>{
            this.setState({
                showFoot:0,
            });
        },this.state.pageIndex==1?true:false);
    }

    /**
     * 请求分类
     */
    requestClassify(){
        let paramMap = new Map();
        paramMap.set('__cmd' , 'guest.ask.getDepartment');
        paramMap.set('py' , "");
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap , (res)=>{
            this.requestAllAsk()
            let cateoryArray = YFWHealthAskCategoryQuestionModel.getCategoryArray(res.result.items);
            this.setState({
                categoryData:cateoryArray,
            });
        },()=>{},false);
    }


    //@ View

    render() {

        return(
            <View style={[BaseStyles.container]}>
                <AndroidHeaderBottomLine />
                <FlatList
                    ref={(flatList)=>this._flatList = flatList}
                    extraData={this.state}
                    data={this.state.dataArray}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.loading}
                    renderItem = {this._renderListItem.bind(this)}
                    ListHeaderComponent={this._renderHeaderView.bind(this)}
                    ListFooterComponent={this._renderFooter.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    onEndReachedThreshold={0.1}
                />
            </View>
        );

    }

    _renderListItem = (item) => {

        return (
            <YFWHealthAskQuestionItemView Data={item.item} navigation={this.props.navigation}/>
        );

    }



    _renderHeaderView(){

        let showTitle = '展开全部分类  ▾';
        if (this.state.allHeader){
            showTitle = '收起分类  ▴';
        }

        return(
            <View style={{marginBottom:10}}>
                <View style={{flexDirection:'row', flexWrap:'wrap',backgroundColor:'white'}}>
                    {this._renderCategoryItem(this.state.categoryData)}
                </View>
                <View style={{backgroundColor:'white',width:kScreenWidth,height:15}}/>
                <View style={{height:50,backgroundColor:'white'}}>
                    <TouchableOpacity style={[BaseStyles.centerItem,{flex:1}]} onPress={()=>this._changeHeaderStateMethod()}>
                        <Text style={{fontSize:12,color:yfwGreenColor()}}>{showTitle}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );

    }

    _renderFooter(){

        return <YFWListFooterComponent showFoot={this.state.showFoot}/>

    }

    _renderCategoryItem(items){

        var allBadge = [];

        if (isNotEmpty(items)){

            let forCount = items.length > 8 ? 8 : items.length;
            if (this.state.allHeader) {
                forCount = items.length;
            }

            for (var i=0;i<forCount;i++){

                let badge = items[i];
                allBadge.push(

                    <TouchableOpacity activeOpacity={1} key={'item'+i} style={{marginLeft:10,marginTop:10}}  onPress={()=>this._clickCategoryItemMethod(badge)}>
                        <View style={[BaseStyles.centerItem,{borderWidth:0.5,borderRadius:5,borderColor:'#bbb',width:(kScreenWidth-50)/4 , height:35}]}>
                            <Text style={[BaseStyles.contentWordStyle]}>{badge.dep_name}</Text>
                        </View>
                    </TouchableOpacity>

                );
            }

        }

        return allBadge;

    }


}


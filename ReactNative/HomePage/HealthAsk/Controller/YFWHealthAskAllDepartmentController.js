import React, {Component} from 'react';
import {
    Platform,
    View,
    ScrollView,
    TextInput,
    Image,
    Text,
    TouchableOpacity,
    FlatList
} from 'react-native';
import {itemAddKey, isEmpty, kScreenWidth, isNotEmpty,adaptSize, kScreenHeight} from "../../../PublicModule/Util/YFWPublicFunction";
import {darkTextColor,darkNomalColor} from '../../../Utils/YFWColor'
import {BaseStyles} from "../../../Utils/YFWBaseCssStyle";
import YFWRequestViewModel from "../../../Utils/YFWRequestViewModel";
import {pushNavigation} from "../../../Utils/YFWJumpRouting";
import YFWHealthAskAllDepartmentModel from "../Model/YFWHealthAskAllDepartmentModel";
import AndroidHeaderBottomLine from "../../../widget/AndroidHeaderBottomLine";
import LinearGradient from "react-native-linear-gradient";
export default class YFWHealthAskAllDepartmentController extends Component {

    static navigationOptions = ({navigation}) => ({

        tabBarVisible: false,
        title:'健康问答',
    });


    constructor(props, context) {

        super(props, context);

        this.state = {
            dataArray:[],
            selectIndex:0
        }
    }

    componentDidMount(){

        this._handleData();

    }

    //@ Action


    _clickBaseDepartmentMethod(badge){

        const { navigate } = this.props.navigation;
        pushNavigation(navigate,{type:'get_ASK_all_category', categoryid:badge.dep_id , title:badge.dep_name , py_name:badge.py_name,parent_py:badge.py_name});

    }

    _clickDepartmentItemMethod(badge){

        const { navigate } = this.props.navigation;
        pushNavigation(navigate,{type:'get_ASK_all_category', categoryid:badge.dep_id , title:badge.dep_name , py_name:badge.py_name,parent_py:badge.parent_py});

    }



    //@Request
    _handleData(){

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.ask.getAllDepartment');
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            let dataArray = YFWHealthAskAllDepartmentModel.getModelArray(res.result);
            this.setState({
                dataArray:dataArray.item,
            });
        });

    }


    //@ View

    render() {

        return(
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:58}}>
                {/* <AndroidHeaderBottomLine /> */}
                {/* <ScrollView style = {{flex: 1, backgroundColor: 'white'}}>
                    {this._renderAllDepartment()}
                </ScrollView> */}
                <FlatList
                    ref={(flatList)=>this._flatList = flatList}
                    style={{width:adaptSize(93)}}
                    extraData={this.state}
                    data={this.state.dataArray}
                    renderItem = {this._renderLeftListItem.bind(this)}
                    showsVerticalScrollIndicator = {false}
                />

                <ScrollView style = {{backgroundColor: 'white',width:kScreenWidth-adaptSize(93),marginLeft:0}}>
                    {this._renderRightListItem()}
                </ScrollView>
            </View>
        );

    }

    _renderLeftListItem({item,index}){
        if(this.state.dataArray.length > 0){
            return (
                <TouchableOpacity activeOpacity={1} onPress={this._pressRow.bind(this, index)}
                    style={[BaseStyles.centerItem,{flexDirection:'row',alignItems:'center',backgroundColor:'white',height: adaptSize(40),width:adaptSize(93)
                }]}>
                    <View style={{width:adaptSize(5),height:adaptSize(40),backgroundColor:this.state.selectIndex == index?'rgb(31,219,155)':'transparent'}}/>
                    <View style={{flex:1,alignItems:'center'}}>
                        <Text style={[BaseStyles.titleWordStyle,{fontSize:14,color:this.state.selectIndex == index ? '#333333' : '#999999'}]}>{item.dep_name}</Text>
                    </View>
                </TouchableOpacity>
            );
        }
    }
    _renderRightListItem(){
        if (this.state.dataArray.length > 0){
          return(
              this._renderDepartmentView(this.state.dataArray[this.state.selectIndex])
              )
        }
    }

    _pressRow(index) {
        this.setState({
            selectIndex:index
        })
    }

    _renderAllDepartment(){

        if (this.state.dataArray.length > 0){


            var allBadge = [];
            let dataArray = this.state.dataArray;

            for (var i=0;i<dataArray.length;i++){

                let badge = dataArray[i];
                allBadge.push(
                    <View key={'all'+i}>
                        {this._renderDepartmentView(badge)}
                    </View>
                );
            }

            return allBadge;


        }

    }

    _renderDepartmentView(badge){

        return(
            <View style={{marginTop:10,marginBottom:5}}>
                <View style={[BaseStyles.leftCenterView,{height:30,width:kScreenWidth-adaptSize(93),marginLeft:0,}]}>
                    <TouchableOpacity onPress={()=>this._clickBaseDepartmentMethod(badge)} style={[BaseStyles.leftCenterView,{justifyContent:'space-between'}]}>
                        <View style={[BaseStyles.leftCenterView,{height:30,justifyContent:'space-between',flex:1,marginLeft:6}]}>
                            {/* <View style={{
                            paddingHorizontal:3,height:20,flex:1,borderRadius: 3,shadowColor: "rgba(31, 219, 155, 0.5)",
                            shadowOffset: {
                                width: 0,
                                height: 3
                            },
                            shadowRadius: 7,
                            shadowOpacity: 1}}>
                                <Text style={{fontSize:14,color:darkNomalColor(),marginTop:3}}>{badge.dep_name}</Text>
                            </View> */}
                            <View style={{ marginLeft:10,shadowColor: "rgba(31, 219, 155, 0.5)",
                                            shadowOffset: {
                                                width: 0,
                                                height: 4
                                            },
                                            shadowRadius: 8,
                                            shadowOpacity: 1,
                                            elevation:2,}}>
                                <LinearGradient colors={['rgb(40,225,164)','rgb(31,219,155)']}
                                            start={{x: 0, y: 1}} end={{x: 1, y: 0}}
                                            locations={[0,1]}
                                            style={{paddingHorizontal:3,height:20,borderRadius: 3,}}
                                            >
                                    <Text style={{fontSize:14,color:'white',marginTop:3}}>{badge.dep_name}</Text>
                                </LinearGradient>
                            </View>
                            <View style={{marginRight: 12,flexDirection:'row',alignItems:"center"}}>
                                <Text style={{fontSize:12,color:'#999999'}}>查看所有问题</Text>
                                <Image style={{width: 7, height: 12,marginLeft:3}}
                                   source={require('../../../../img/around_detail_icon.png')}/>
                            </View>

                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{flexDirection:'row', flexWrap:'wrap',width:kScreenWidth - adaptSize(93)-26}}>
                    {this._renderDepartmentItem(badge.item)}
                </View>
            </View>
        );

    }

    _renderDepartmentItem(items){

        var allBadge = [];

        if (isNotEmpty(items)){

            for (var i=0;i<items.length;i++){

                let badge = items[i];
                allBadge.push(

                    <TouchableOpacity activeOpacity={1} key={'item'+i} style={{marginLeft:13,marginTop:10}}  onPress={()=>this._clickDepartmentItemMethod(badge)}>
                        <View style={[BaseStyles.centerItem,{borderRadius:14,backgroundColor:'#fafafa',height:28}]}>
                            <Text style={[BaseStyles.contentWordStyle,{marginLeft:12,marginRight:12,color:darkNomalColor()}]}>
                                {badge.dep_name}
                            </Text>
                        </View>
                    </TouchableOpacity>

                );
            }

        }

        return allBadge;

    }



}


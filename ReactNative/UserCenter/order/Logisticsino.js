import React from 'react'
import {
    View,
    Platform,
    Dimensions,
    ImageBackground,
    Image,
    TouchableOpacity,
    Text,
    ScrollView,
    FlatList
} from 'react-native'
import DashLine from '../../widget/DashLine'
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {isNotEmpty, isEmpty, tcpImage, safe} from '../../PublicModule/Util/YFWPublicFunction'
import {pushNavigation} from "../../Utils/YFWJumpRouting";
const width = Dimensions.get('window').width;
export default class Logisticsino extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showTips: true,
            allDataArray: [{"info": "logisticsinfo"}, {'info': 'highlights'}],
            bottomDataArray: [{"info": "logisticsinfo"}, {'info': ''}],
            pageIndex: 0,
            loading: false,
            heights: new Map()
        }
    }

    render() {
        let date = isNotEmpty(this.props.dataArray) ? this.props.dataArray : []
        return (
            <View style={[{width:width-24,flex:1,marginLeft:12}]}>
                <FlatList style={[{width:width-24,backgroundColor:'#ffffff',marginBottom:4},BaseStyles.radiusShadow]}
                          ListHeaderComponent={this._renderHeader}
                          ListFooterComponent={this._renderFooter}
                          renderItem={this._renderItem}
                          keyExtractor={(item, index) => index+""}
                          data={date}
                >
                </FlatList>
            </View>
        )
    }


    onRefrshIconClick() {
        this.props.refreshLodisticsInfo()
    }

    _renderHeader = (item)=> {
        return(
            <View style={{width:width-24,}}>
                <View style={{width:width-24,height:51,flexDirection:'row',justifyContent:'space-between', alignItems:'center', paddingTop:10}}>
                    <Text style={{marginLeft:23,fontSize:15,color:'#333333'}}>物流跟踪</Text>
                    <TouchableOpacity hitSlop={{left:10,top:10,bottom:10,right:0}} onPress={()=> this.onRefrshIconClick()} activeOpacity={1}>
                        <Image source={require('../../../img/Wl_icon_sx.png')}
                            style={{marginRight:22,width:16,height:16,resizeMode:'stretch'}}/>
                    </TouchableOpacity>
                </View>
                <View style={{marginLeft:23,marginRight:22,height:1,marginBottom:12,backgroundColor:'rgba(240,240,240,1)'}}/>
            </View>
        )
    }

    _renderFooter = (item)=> {
        if(isEmpty(this.props.switchText)){
            return(<View style={{width:width-24,height:10,}}/>)
        }else{
            return(
                <View style={[{width:width-24,height:40,}]}>
                    <TouchableOpacity activeOpacity={1}
                        hitSlop={{left:0,top:0,bottom:10,right:0}}
                        onPress={()=>this.props.renderHideAndShow()}>
                        <View style={[BaseStyles.centerItem,{flexDirection:'row',marginTop:13}]}>
                            <Image style={{width:13,height:13}}
                            source={safe(this.props.switchImage)?this.props.switchImage:''}/>
                            <Text style={{fontSize:12,color:'#cccccc'}}>{this.props.switchText}</Text>
                        </View>
                    </TouchableOpacity>

                </View>
            )
        }
    }
    _renderItem = (item)=> {
        let {date, time} = this.formatData(item.item.time)
        if (item.index == 0) {
            return (<View
                style={{backgroundColor:'#FFF',flexDirection:'row',flex:1,width:width-24}}>
                <View style={{marginLeft:23}}>
                    {/* <View style={{flex:1,width:8,alignItems:'center',flexWrap:'nowrap'}}
                          onLayout={(e)=>this.measure(e,item.index)}>
                        <DashLine backgroundColor={'#E5E5E5'} len={this.state.heights.get(item.index)}
                                  flexD={1}/>
                    </View> */}
                    <View style={{flex:1,width:10,alignItems:'center'}} >
                          <View style={{width:1,flex:1,backgroundColor:'#cccccc',marginTop:2}}></View>
                    </View>
                    <Image style={{position:'absolute',
                        top:2,width:10,height:10,
                        resizeMode:'contain',
                        backgroundColor:'rgba(31,219,155,1)',
                        borderRadius:5}}
                           />

                </View>
                <View style={{marginLeft:10,width:width-87}}>
                    <View style={{}}>
                        {/* <View style={{flex:1}}>
                            <Text style={{fontSize:10 ,color:"#333333",flex:1}}>{item.item.status}</Text>
                            {/* <TouchableOpacity onPress={()=> this.onRefrshIconClick()} activeOpacity={1}>
                                <Image style={{width:20,height:20,resizeMode:'contain'}}
                                    source={ require('../../../img/f5_icon.png')}/>
                            </TouchableOpacity> */}
                        {/* </View> */}
                        <Text style={{fontSize:12,color:'rgba(31,219,155,1)'}}>{item.item.status} {item.item.context}</Text>
                        <View style={{flexDirection:'row'}}>{this.bottonView(item)}</View>
                    </View>
                    <Text style={{marginTop:2,fontSize:12,color:'#8d8d8d'}}>{date}  {time}</Text>
                </View>

            </View>)

        } else {
            return ( <View
                style={{backgroundColor:'#FFF',flexDirection:'row',flex:1,width:width-24}}>
                <View style={{marginLeft:23}}>
                    <View style={{flex:1,width:10,alignItems:'center'}} >
                          <View style={{width:1,flex:1,backgroundColor:'#cccccc'}}></View>
                    </View>
                    <Image style={{position:'absolute',top:4,
                            marginTop:22,width:10,height:10,
                            resizeMode:'contain',
                            backgroundColor:'#cccccc',
                            borderRadius:5}}
                           />
                </View>
                <View style={{marginLeft:10,width:width-87,marginTop:24}}>
                    <Text style={{fontSize:12,color:'#8d8d8d'}}>{item.item.status} {item.item.context}</Text>
                    <Text style={{marginTop:2,fontSize:12,color:'#8d8d8d'}}>{date}  {time}</Text>
                </View>
            </View>)

        }
    }

    bottonView = (item) => {
        let botton = [];
        if (isEmpty(item.item.buttons))
            return (<View/>);
        item.item.buttons.map((item, index)=> {
            botton.push(
                <TouchableOpacity activeOpacity={1} onPress={()=>{
                    const { navigate } = this.props.navigation;
                    pushNavigation(navigate,{type:item.type,value:item.value});
                }}
                                  style={[BaseStyles.centerItem,{width:(item.name.length*14+20),flex:null,borderWidth:1,borderColor:'#999999',borderRadius:5,paddingTop:5,paddingBottom:5,marginTop:10,marginLeft:index==0?0:10}]}>
                    <Text style={{fontSize:14,color:'#333333'}}>{item.name}</Text>
                </TouchableOpacity>)
        });
        return botton;
    }

    formatData(time) {
        let date = {date: '', time: ''}
        if (isNotEmpty(time)) {
            let dateAndTime = time.split(' ')
            if (isNotEmpty(dateAndTime)) {
                if (dateAndTime.length > 0) {
                    let array = dateAndTime[0].split('-')
                    if (array.length > 2) {
                        date.date = array[0] + "-" + array[1] + "-" + array[2]
                    }
                }
                if (dateAndTime.length > 1) {
                    let array = dateAndTime[1].split(':')
                    if (array.length > 1) {
                        date.time = array[0] + ":" + array[1]
                    }
                }
            }
        }
        return date
    }

    measure(e, index) {
        let {height} = e.nativeEvent.layout;
        this.state.heights.set(index, Math.floor(height / 4));
        if (isNotEmpty(this.props.dataArray) && this.props.dataArray.length - 1 == index) {
            this.setState({
                heights: this.state.heights
            })
        }
    }

}

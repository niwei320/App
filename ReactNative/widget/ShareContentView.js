import React from 'react'
import {
    View,
    Dimensions,
    Image,
    Text
} from 'react-native'

const {width, height} = Dimensions.get('window');
import {backGroundColor, darkLightColor, darkNomalColor, darkTextColor, yfwOrangeColor} from '../Utils/YFWColor'
import Echarts from 'native-echarts'
import {kScreenWidth, safe, safeObj, tcpImage} from "../PublicModule/Util/YFWPublicFunction";
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {toDecimal} from "../Utils/ConvertUtils";
export default class ShareContentView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        if (this.props.type == 'Poster') {
            const img = this.props.from=='shop' ? safe(safeObj(this.props.shareData).image) : tcpImage(safeObj(safeObj(safeObj(this.props.shareData).img_url)[0]))
            return (
                <View>
                    <View
                        style={{backgroundColor:'#FFFFFF',marginLeft:20,marginRight:20,marginTop:15,alignItems:'center'}}>
                        <Image  style={{width:width-180,height:width-180, resizeMode:'contain'}}
                                source={{uri: img}}>
                        </Image>
                        <Text style={{color:'#666666',fontSize:13,marginLeft:10,marginRight:10}}>{this.props.shareData.title}</Text>
                        {this.props.from == 'shop' ? <View style={{marginBottom: 15}}></View> :
                        <View>
                            <Text style={{color:'#666666',fontSize:10,marginTop:5}}>{this.props.shareData.Standard}</Text>
                            <Text style={{color:yfwOrangeColor(),fontSize:13,marginTop:5,marginBottom:15}}>¥ {toDecimal(this.props.shareData.price)}</Text>
                        </View>}
                    </View>
                </View>
            )
        } else {
            const data = this.props.data;
            const option = {
                animation:false,
                //点击某一个点的数据的时候，显示出悬浮窗
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: [
                    {
                        //就是一月份这个显示为一个线段，而不是数轴那种一个点点
                        boundaryGap: true,
                        type: 'category',
                        data: data.xData,
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                fontSize: 8
                            }
                        },

                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        splitLine: {
                            show: false,
                        },
                        axisLabel: {
                            textStyle: {
                                fontSize: 8
                            }
                        },
                    }
                ],
                //图形的颜色组
                color: ['#16c08e'],
                //需要显示的图形名称，类型，以及数据设置
                series: [
                    {
                        //默认显
                        type: 'line',
                        data: data.yData
                    }
                ]
            };
            return (
                <View>
                    <Text style={{width:width-90,marginLeft:10,marginRight:10,marginTop:30}}>
                        <Text style={{fontSize:12,color:'#333333'}}>{data.goods_name}</Text>
                        <Text style={{color:'#FD6C01',fontSize:10,backgroundColor:'#FFC97C'}}>{data.time}</Text>
                    </Text>
                    <Text style={{fontSize:12,color:darkLightColor(),marginLeft:10,marginTop:20}}>{data.mill_title}</Text>
                    <View style={{flexDirection:'row',width:width-70,marginTop:20}}>
                        {this._renderNumberItem('均价','¥'+toDecimal(data.price))}
                        {this._renderNumberItem('浏览次数',data.visit_count)}
                        {this._renderNumberItem('在售商家',data.shop_count)}
                    </View>
                    <Echarts option={option} height={200} width={width-75} roam={false}/>
                    <View style={{position:'absolute',marginTop:10,left:0,width:width-70,height:300}}/>
                </View>
            )
        }
    }

    _renderNumberItem(title,value){

        return(
            <View style={[BaseStyles.centerItem,{flex:1}]}>
                <Text style={{fontSize:12,color:darkNomalColor()}}>{title}</Text>
                <Text style={{fontSize:14,color:darkTextColor(),marginTop:5}}>{value}</Text>
            </View>
        );

    }

}

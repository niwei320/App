import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Image,
    View,
    Text,
    TouchableOpacity, Dimensions
} from 'react-native';

import YFWCheckButton from '../../PublicModule/Widge/YFWCheckButtonView';
import {darkNomalColor,darkTextColor,yfwGreenColor,separatorColor,yfwOrangeColor} from "../../Utils/YFWColor";

export default class YFWCollectionBottomView extends Component {

    static defaultProps = {
        Data:[],
        selectAll:false,
    }

    render() {
        return (
            <View style={{flex:1}}>
                <View style={styles.separatorStyle}/>
                <View style={styles.container}>
                    <View accessibilityLabel='collection_select_all' style={styles.checkButton}>
                        <YFWCheckButton style={{flex:1}} selectFn={()=>this._selectAll()}
                                        select={this.props.selectAll}/>
                    </View>
                    <Text style={{marginLeft:8,color:'#333',fontSize:13}}>全选</Text>
                    <View style={{flex:1}}/>
                    <View style={styles.view3Style}>
                        <TouchableOpacity activeOpacity={1} style={{flex:1,justifyContent:'center', alignItems:'center'}} onPress={()=>this._orderDeleteMethod()}>
                            <Text style={styles.payStyle}>删除</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

        );
    }

    _selectAll(){

        if (this.props.selectAllFn){
            this.props.selectAllFn();
        }

    }
    //删除
    _orderDeleteMethod(){
        if (this.props.delFn){
            this.props.delFn()
        }

    }
}

//设置样式
const styles = StyleSheet.create({
    container: {
        flex:1,
        height:50,
        backgroundColor:'white',
        flexDirection: 'row',
        alignItems:'center'
    },
    checkButton:{
        marginLeft:12,
        width:22,
        height:22,
    },
    view1Style:{
        flex:1,
        height:50,
        marginLeft:10,
    },
    titleStyle:{

        fontSize: 16,
        height:25,
        width : 150,
        color:darkTextColor(),
        marginTop:10,
        marginLeft:10,
    },
    regionStyle:{

        fontSize: 11,
        //width:100,
        color:darkNomalColor(),
        marginLeft:10,

    },
    view3Style:{
        width:119,
        height:50,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#ff3300',
        marginRight:0,
    },

    separatorStyle:{
        backgroundColor:separatorColor(),
        height:0.5,
        width: Dimensions.get('window').width,
    },
    payStyle:{
        color:'white',
        fontSize:16,
    }

});
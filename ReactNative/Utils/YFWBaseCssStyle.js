import {backGroundColor, darkNomalColor, darkTextColor,darkLightColor, separatorColor, yfwOrangeColor} from "./YFWColor";
import {Dimensions, StyleSheet} from "react-native";
import {kScreenWidth} from "../PublicModule/Util/YFWPublicFunction";

export const BaseStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
        alignItems: 'stretch',
        justifyContent:'flex-start',
        backgroundColor: backGroundColor(),
    },
    item:{
        marginTop:0,
        marginLeft:0,
        marginRight:0,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'

    },
    centerItem:{
        alignItems:'center',
        justifyContent:'center'
    },
    imageStyle:{
        marginLeft:12,
        height:72,
        width:72,
    },
    separatorStyle:{
        backgroundColor:separatorColor(),
        height:1,
        width: kScreenWidth - 10,
        marginLeft:10,
        marginBottom:0,
    },
    verticalSeparatorStyle:{
        backgroundColor:separatorColor(),
        width: 0.5,
        marginTop:0,
        marginBottom:0,
    },
    titleWordStyle:{
        fontSize: 14,
        color:darkTextColor(),
    },
    titleStyle:{
        fontSize: 15,
        color:darkTextColor(),
        marginTop:10,
        marginLeft:10,
    },
    contentWordStyle:{
        fontSize: 13,
        color:darkLightColor(),
    },
    contentStyle:{
        fontSize: 13,
        color:darkNomalColor(),
        marginTop:10,
        marginLeft:10,
    },
    leftCenterView:{
        flexDirection:'row',
        alignItems:'center',
    },
    rightCenterView:{
        flexDirection:'row-reverse',
        alignItems:'center',
    },
    borderView:{
        borderColor:'#cccccc',
        borderRadius:10,
        borderWidth:1,
        backgroundColor:'white',
    },
    topRightPoint:{
        width:12,
        height:12,
        backgroundColor:yfwOrangeColor(),
        borderRadius:6,
    },
    sectionListStyle: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: backGroundColor(),
        width: kScreenWidth
    },
    radiusShadow:{
        shadowColor: "rgba(206, 206, 206, 0.28)",
        shadowOffset: {width: 1, height: 1},
        elevation: 2,
        shadowRadius: 4,
        shadowOpacity: 1,
        borderRadius: 7
    }
});
import React, {Component} from 'react'
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native'
import {darkTextColor,darkNomalColor,darkLightColor} from '../Utils/YFWColor'
import {safe} from '../PublicModule/Util/YFWPublicFunction'
import {pushNavigation} from '../Utils/YFWJumpRouting'

export default class YFWGoodsDetailCommentCell extends Component {
    render(){
        let model = this.props.model
        let index = this.props.index
        return(
            <View key={index}>
                        <View key={index} style={styles.container} >
                            {/* <StartScore  currentScore={model.send_star}/> */}
                            <Image style={styles.image} source={{uri:safe(model.intro_image).replace("https","http")}}/>
                            <Text style={styles.accountText}>{model.eval_account_name}</Text>
                            <View style={{flex:1}}/>
                            <Text style={styles.time}>{model.eval_create_time}</Text>
                        </View>
                        <View style={styles.context}>
                            <Text style={{color:darkTextColor(),fontSize:13,lineHeight: 15,}}>{model.eval_content}</Text>
                        </View>
                        {/* {this._renderReply("商家回复：",model.reply_content)}
                        {this._renderReply("商城回复：",model.admin_reply_content)}
                        <View style={{backgroundColor:separatorColor(),height:1,marginTop:9,marginLeft:15,width:Dimensions.get('window').width}}/> */}
                    </View>
        )


    }

    /**
     * 商家或商城回复
     * @private
     */
    _renderReply(type,content){
        if(isNotEmpty(content)){
            return(
                <View style={{backgroundColor:backGroundColor(),marginTop:10,marginLeft:15,marginRight:15,padding:10}}>
                    <Text >
                        <Text style={{fontSize:13,color:darkLightColor()}}>{type}</Text>
                        <Text style={{fontSize:13,color:darkNomalColor()}}>{content}</Text>
                    </Text>
                </View>
            )
        }
    }



}

const styles = StyleSheet.create({
    container: {
        flexDirection:'row',
        alignItems:'center',
        height:44,
        flex:1,
        paddingHorizontal:14,
        paddingTop:17
    },
    accountText: {
        color:darkNomalColor(),
        fontSize:11,
        marginLeft:7
    },
    image: {
        height:27,
        width:27,
        borderRadius:27/2,

    },
    time: {
        color:darkLightColor(),
        fontSize:10,
    },
    context: {
        flex:1,
        marginLeft:12,
        marginRight:10,
        marginTop:12,
        marginBottom:17
    }
});
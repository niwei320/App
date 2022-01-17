import React from 'react'
import {
    View,
    TouchableOpacity,
    ImageBackground,
    Image
} from 'react-native'

import {safeObj,isNotEmpty} from '../PublicModule/Util/YFWPublicFunction'
import {pushNavigation} from '../Utils/YFWJumpRouting'

export default class YFWHomeShroudView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        var img_url = ''
        var price = ''
        if(isNotEmpty(this.props.ShroudData)&&this.props.ShroudData.length>0){
            let data = this.props.ShroudData[0];
            img_url = safeObj(safeObj(data).img_url);
            return(
                <TouchableOpacity style={{height:this.props.size,width:this.props.size,marginRight:35}} onPress = {()=>this._onMedicineCilck()} activeOpacity={1}>
                    <ImageBackground style={{flex:1,alignItems:'center',justifyContent:'center'}} source={require('../../img/shroud_bg.png')}>
                        <Image style={{resizeMode:'contain',width:this.props.size-6,height:this.props.size-6}} source={{uri:img_url}}/>
                        <Image style={{width:15,height:15,resizeMode:'contain',position:'absolute',top:this.props.size-20,left:this.props.size-20}} source={require('../../img/home_shroud_jump_icon.png')}/>
                    </ImageBackground>
                </TouchableOpacity>
            )
        }else {
            return(<View/>)
        }
    }

    _onMedicineCilck(){
        const { navigate } = this.props.navigation;
        pushNavigation(navigate,this.props.ShroudData[0]);
    }
}

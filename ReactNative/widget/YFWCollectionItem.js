import React, {Component} from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Image
} from 'react-native'
import {BaseStyles} from "../Utils/YFWBaseCssStyle";
import {backGroundColor, yfwOrangeColor,darkNomalColor} from "../Utils/YFWColor";
import {isNotEmpty, kScreenWidth, safe, tcpImage} from "../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../Utils/ConvertUtils";

export default class YFWCollectionItem extends Component {

    static defaultProps = {
        item:{},
        index:0,
    }

    constructor(props) {
        super(props);
        this.state = {
            stateItem:this.props.item,
        }
    }

    componentWillReceiveProps(newProps){

        this.setState({
            stateItem:newProps.item,
        });

    }

    // ======== Action ========
    clickMethod() {

        if (this.props.click) this.props.click();

    }


    // ======== View ========
    render() {

        let uneven = false;
        if (this.props.index % 2 == 0 ){
            uneven = true;
        }

        return (
            <View style={[BaseStyles.centerItem,{backgroundColor: backGroundColor()}]}>
                <TouchableOpacity activeOpacity={1} style={{flex:1}} onPress={()=>this.clickMethod()}>
                    <View style={[BaseStyles.centerItem,{width:(kScreenWidth-15)/2,height:220,backgroundColor:'white',
                        marginBottom:5,marginLeft:uneven?5:2.5,marginRight:uneven?2.5:5}]}>
                        <Image style={{height:135,width:135,resizeMode:'contain'}}
                               source={{uri:tcpImage(safe(this.state.stateItem.image_url))}}
                               defaultSource={require('../../img/default_img.png')}/>
                        <View style={[BaseStyles.centerItem,{width:(kScreenWidth-15)/2-30,marginTop:10}]}>
                            <Text style={[BaseStyles.titleWordStyle,{textAlign:'center',fontSize:13}]} numberOfLines={2}>{safe(this.state.stateItem.title)}</Text>
                        </View>
                        {this._renderStandard()}
                        <View style={[BaseStyles.leftCenterView,{marginTop:5}]}>
                            <Text style={[BaseStyles.titleWordStyle,{color:yfwOrangeColor(),fontSize:13}]}>{safe(this.state.stateItem.price)}</Text>
                            {this._renderDiscount()}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }



    _renderStandard(){

        if (isNotEmpty(this.state.stateItem.standard)){

            return (
                <Text style={{width:(kScreenWidth-15)/2,textAlign:'center',fontSize:13,color:darkNomalColor()}} numberOfLines={1}>{safe(this.state.stateItem.standard)}</Text>
            );

        } else {

            return (<View/>);

        }

    }

    _renderDiscount(){

        if (isNotEmpty(this.state.stateItem.discount) && this.state.stateItem.discount.length > 0){

            return (
                <View style={[BaseStyles.centerItem,{marginLeft:5,padding:1,borderWidth:1,borderColor:yfwOrangeColor()}]}>
                    <Text style={[{fontSize:10,color:yfwOrangeColor()}]}>{this.state.stateItem.discount}</Text>
                </View>
            );

        } else {
            return (<View/>);
        }

    }

}
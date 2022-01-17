import React, { Component } from 'react';
import { View, Animated, Easing,Text,Image,Dimensions ,TouchableOpacity} from 'react-native';

export default class YFWMarqueeView extends Component {

    constructor(args){
        super(args)
        this.state = {
            bgViewHeight: 0,
            duration: 1500,
            info:{},
        }
        this.currentIndex = 0
        this.animation = null
        this.animatedTransformY = new Animated.Value(0)
    }
    static defaultProps = {
        datasArray:[],
        callBack:()=>{}
    }

    componentWillMount() {
        this.setState({
            info: this.props.datasArray[0] || {}
        });
    }
    componentWillUnmount() {
        if (this.animation) {
            this.animation.stop()
        }
    }

    componentDidMount(){
        this.showAnimation()
    }

    showAnimation(){
        if (!this.props.datasArray||this.props.datasArray.length <= 1) {//一个物流信息，默认不展示轮播效果
            return
        }
        this.animation = Animated.timing(this.animatedTransformY, {
            toValue: -81*this.currentIndex,
            duration: this.state.duration,
            useNativeDriver: true,
            easing: Easing.linear,
            delay:2000,
        })
        this.animation.start(() => {
            this.animatedTransformY.setValue(-81*this.currentIndex)
            let currentIndex = 0
            if (this.currentIndex < this.props.datasArray.length) {
                currentIndex = this.currentIndex + 1
            } else {
                this.animatedTransformY.setValue(0)
            }
            this.currentIndex = currentIndex
            this.showAnimation()
        })
    }

    bgViewOnLayout(e) {
        this.setState({
            bgViewHeight: e.nativeEvent.layout.height,
        })
    }

    render() {
        const { 
            bgViewStyle, // Background View Custom Styles
        } = this.props;

    return (
    <View 
        style={{ ...styles.bgViewStyle, ...bgViewStyle}}
        onLayout={(event) => this.bgViewOnLayout(event)}
    >
    <Animated.View 
        style={{transform: [{ translateY:this.animatedTransformY }]}}>
        {this.renderContent()}
    </Animated.View>
    </View>
    )
    }   
    renderContent(){
        let views = []
        this.props.datasArray.map((infos,index)=>{
            views.push(this.renderInfoView(infos,index))
        })
        views.push(this.renderInfoView(this.props.datasArray[0],0))
        return views
    }

    renderInfoView(infos,index){
        return (
            <TouchableOpacity activeOpacity={1} onPress={()=>{this.props.callBack(index)}} style={{flexDirection:'row',alignContent:'center',backgroundColor:'white',height:81,backgroundColor:'white'}}>
                    <Image style={{width:67,height:67,marginLeft:3,resizeMode:'contain'}} source={{uri:infos.imageurl}}></Image>
                    <View style={{marginLeft:10,flex:1}}>
                        <View style={{marginTop:14,flexDirection:'row'}}>
                            <Text style={{color:'#1fdb9b',fontSize:15}}>{infos.status}</Text>
                            <View style={{flex:1}}></View>
                            <Text style={{color:'#666',fontSize:12,marginRight:15}}>{infos.time}</Text>
                        </View>
                        <Text style={{color:'#666',fontSize:12,marginTop:10}} numberOfLines={2}>{infos.content}</Text>
                    </View>
            </TouchableOpacity>
        )
    }
}

const styles = {
        bgViewStyle: {
        overflow: 'hidden',
        height:81,
        padding:3,
    },
};
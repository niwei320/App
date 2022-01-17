import React, { Component } from 'react';
import { View, Animated, Easing, Text,TouchableOpacity } from 'react-native';

export default class YFWTextMarqueeView extends Component {
  

  constructor(args) {
    super(args)
    this.state = {
      duration: 400,
      currentIndex:0
    };
    this.animatedTransformY = new Animated.Value(0);
    this.animation = null;
  }

  static defaultProps = {
      textsArray:[],
  }

  componentWillUnmount() {
    if (this.animation !== null) {
      this.animation.stop();
    }
  }

  componentDidMount(){
    this.showAnimation()
  }
  showAnimation(){
    this.animation = Animated.timing(this.animatedTransformY, {
      toValue: -40,
      duration: this.state.duration,
      useNativeDriver: true,
      easing: Easing.linear,
      delay:3000,
    })
    this.animation.start(()=>{
        let currentIndex = 0
        this.animatedTransformY.setValue(0)
        currentIndex = this.state.currentIndex+1
        if (currentIndex >= this.props.textsArray.length) {
          currentIndex = 0
        }
        this.setState({
          currentIndex:currentIndex
        },()=>{
          this.showAnimation()
        })
    })
  }


  render() {
    const { 
      bgViewStyle, // Background View Custom Styles
      textStyle, // Text Custom Styles, e.g. {textAlign: 'center'}
    } = this.props;

    const { text, animation } = this.state;

    return (
      <TouchableOpacity 
        style={{ ...styles.bgViewStyle, ...bgViewStyle}}
        activeOpacity = {1}
        onPress={()=>this.clickedAction()}
      >
        <Animated.View 
          style={{
            transform: [{ translateY: this.animatedTransformY }],
          }}
        >
        {this.renderTextView()}
        </Animated.View>
        
      </TouchableOpacity>
    );
  }

  renderTextView(){
    const { 
      textStyle, // Text Custom Styles, e.g. {textAlign: 'center'}
    } = this.props;
    let index = this.state.currentIndex
    let newTextsArray = this.props.textsArray.slice(index,index+2)
    if (this.props.textsArray.length - index == 1 ){
      newTextsArray = this.props.textsArray.slice(-1)
      newTextsArray.push(this.props.textsArray[0])
    }
    let views = []
    newTextsArray.map((item,index)=>{
      views.push(
        <View key={index} style={{height:40,justifyContent:'center'}}>
          <Text style={{fontSize:13,color:'#666',flex:1,lineHeight:40,...textStyle}} numberOfLines={1}>{item}</Text>
        </View>
      )
    })

    return views
  }

  clickedAction(){
    if (this.props.callBack) {
      this.props.callBack(this.state.currentIndex)
    }
  }
}

const styles = {
  bgViewStyle: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    height:40,
  },
};
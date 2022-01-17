import React, {
    Component,
} from 'react';
import PropTypes from 'prop-types';
import {View, Image, StyleSheet, Animated, Text} from 'react-native';
export default class YFWOpenText extends Component {
    static propTypes = {
        style: Text.propTypes.style,
        expandTextStyle:Text.propTypes.style,
        numberOfLines: PropTypes.number
    }
    constructor(props){
        super(props);
        this.state = {
            /** 文本是否展开 */
            expanded:true,
            numberOfLines:null,
            /** 展开收起文字是否处于显示状态 */
            showExpandText:false,
            expandText:'展开全部',
            /** 是否处于测量阶段 */
            measureFlag:true
        }
        this.numberOfLines = props.numberOfLines;
        /** 文本是否需要展开收起功能：（实际文字内容是否超出numberOfLines限制） */
        this.measureFlag = true;
    }


    _onTextLayout(event){
        if(this.measureFlag){
            if(this.state.expanded){
                this.maxHeight = parseInt(event.nativeEvent.layout.height.toString());
                this.setState({expanded:false,numberOfLines:this.numberOfLines});
            }else{
                this.mixHeight = parseInt(event.nativeEvent.layout.height.toString());
                if(this.mixHeight == this.maxHeight){
                    this.setState({showExpandText:false})
                }else{
                    this.setState({showExpandText:true})
                }
                this.measureFlag = false;
            }
        }

    }

    _onPressExpand(){
        if(!this.state.expanded){
            this.setState({numberOfLines:null,expandText:'收起',expanded:true})
        }else{
            this.setState({numberOfLines:this.numberOfLines,expandText:'展开全部',expanded:false})
        }
    }

    render() {
        const { numberOfLines, onLayout, expandTextStyle, ...rest } = this.props;
        let expandText = this.state.showExpandText?(<View style={{flexDirection:'row'}}>
                {!this.state.expanded?<Text style={[expandTextStyle,{backgroundColor:'white'}]} onPress={this._onPressExpand.bind(this)}>...</Text>:null}
                <Text style={[styles.expandText,expandTextStyle,{backgroundColor:'white'}]} onPress={this._onPressExpand.bind(this)}>
                    {this.state.expandText}
                </Text>
            </View>
        ) : null;
        return (
            <View>
                <Text numberOfLines={this.state.numberOfLines} ellipsizeMode={'tail'}
                    onLayout={this._onTextLayout.bind(this)}
                    {...rest}
                >
                    {this.props.children}
                </Text>
                <View style={[{flexDirection:'row',position:"absolute",bottom:0,right:26}]}>
                    <View style={{flex:1}}/>
                    {expandText}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    expandText: {
        color:'#1fdb9b',
        marginTop:0
    }


});

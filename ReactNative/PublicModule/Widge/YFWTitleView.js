import React, {Component} from 'react'
import {View, Text, Image, StyleSheet} from 'react-native'
import {darkTextColor} from '../../Utils/YFWColor'
import PropTypes from 'prop-types'
import {kStyleWholesale,kStyleOTO} from "../Util/YFWPublicFunction";
import LinearGradient from "react-native-linear-gradient";
export default class YFWTitleView extends Component {

    static propTypes = {
        title:PropTypes.string,
        hiddenBgImage:PropTypes.bool,
    }
    static defaultProps = {
        hiddenBgImage:false,
        title:''
    }


    render() {
        let title = this.props.title
        let style_title = {
            width: this.props.style_title&&this.props.style_title.width ? this.props.style_title.width : 70,
            fontSize: this.props.style_title&&this.props.style_title.fontSize ? this.props.style_title.fontSize : 15,
            fontWeight: this.props.style_title&&this.props.style_title.fontWeight ? this.props.style_title.fontWeight:'bold',
        };
        let hiddenBgImage = this.props.hiddenBgImage
        let showLine = this.props.showLine
        let type = this.props.type

        switch (this.props.from) {
            case kStyleOTO:
                return (
                    <View style = {[styles.container, {width: style_title.width}]}>
                        {showLine?
                        <LinearGradient colors={['rgb(87,153,247)']}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        locations={[0, 1]}
                                        style={[styles.line, {width: style_title.width*0.6,height:4}]} />
                        :<View />}
                        <View style={styles.titleView}>
                            <Text style={type=='tab'?{color:hiddenBgImage?'#333':'rgb(87,153,247)',fontSize: hiddenBgImage?style_title.fontSize:18,fontWeight:style_title.fontWeight}:[styles.title, {fontSize: style_title.fontSize,fontWeight:style_title.fontWeight}]}>{title}</Text>
                        </View>
                    </View>
                )
            case kStyleWholesale:
                return (
                    <View style = {[styles.container, {width: style_title.width}]}>
                        {showLine?
                        <LinearGradient colors={['#3369ff','#3257ea']}
                                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                        locations={[0, 1]}
                                        style={[styles.line, {width: style_title.width*0.6,height:4}]} />
                        :<View />}
                        <View style={styles.titleView}>
                            <Text style={type=='tab'?{color:hiddenBgImage?'#333':'#416dff',fontSize: hiddenBgImage?style_title.fontSize:18,fontWeight:style_title.fontWeight}:[styles.title, {fontSize: style_title.fontSize,fontWeight:style_title.fontWeight}]}>{title}</Text>
                        </View>
                    </View>
                )
            default:
                return(
                    <View style = {[styles.container, {width: style_title.width}]}>
                        {this.renderBgLineView(type,hiddenBgImage,style_title)}
                        <View style={styles.titleView}>
                            <Text style={type=='tab'?{color:hiddenBgImage?'#333':'#1fdb9b',fontSize: hiddenBgImage?style_title.fontSize:18,fontWeight:style_title.fontWeight}:[styles.title, {fontSize: style_title.fontSize,fontWeight:style_title.fontWeight}]}
                                    accessibilityLabel={this.props.accessibilityLabel}
                                  numberOfLines={1}>{title}</Text>
                        </View>
                    </View>
                )
        }
    }

    renderBgLineView(type,hidden,style_title) {
        if (hidden) {
            return null
        }
        if (type == 'tab') {
            let imageSource = require('../../../img/title_bottom_line_another.png')
            return <Image source={imageSource} defaultSource={imageSource} style={[styles.line, {width: style_title.width*0.6,height:4}]}/>
        } else {
            let imageSource = require('../../../img/title_bottom_line.png')
            return <Image source={imageSource} defaultSource={imageSource} style={[styles.line, {width: style_title.width+4}]}/>
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    titleView: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 13,
    },
    title: {
        color: darkTextColor(),
        fontWeight: 'bold',
    },
    line: {
        position: 'absolute',
        bottom: 7,
        height: 12,
        resizeMode: 'stretch',
    }
})
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import YFWTitleView from './YFWTitleView'
import PropTypes from 'prop-types';
import {kScreenWidth, kStyleWholesale} from '../Util/YFWPublicFunction';
import { BaseStyles } from '../../Utils/YFWBaseCssStyle';

export default class YFWScrollableTabBar extends Component {

    static propTypes = {

        goToPage: PropTypes.func, // 跳转到对应tab的方法
        activeTab: PropTypes.number, // 当前被选中的tab下标
        tabs: PropTypes.array, // 所有tabs集合

        tabNames: PropTypes.array, // 保存Tab名称
        tabStyle: PropTypes.tabStyle,// teb按钮样式
        isShowLine: PropTypes.isShowLine,// teb按钮样式
    };

    // componentDidMount() {
    //     // Animated.Value监听范围 [0, tab数量-1]
    //     this.props.scrollValue.addListener(this.setAnimationValue);
    // }

    // setAnimationValue({value}) {
    //     console.log('动画值：'+value);
    // }

    renderTabOption(tab, i) {
        if (this.props.activeTab == i) {
            if(this.props.from == kStyleWholesale){
                return (
                    <TouchableOpacity key={i+'c'} style={[{width:this.props.width?this.props.width:kScreenWidth/5,height:45},BaseStyles.centerItem]} activeOpacity={1}  onPress={()=>{this.props.goToPage(i)}} >
                            <YFWTitleView from={kStyleWholesale} showLine={this.props.isShowLine} type='tab' style_title={{fontSize:15,width:15*this.props.tabNames[i].length+15}} title={this.props.tabNames[i]}/>
                    </TouchableOpacity>
                )
            }
            return(
                <TouchableOpacity key={i+'c'} style={[{width:this.props.width?this.props.width:kScreenWidth/5,height:45},BaseStyles.centerItem]} activeOpacity={1}  onPress={()=>{this.props.goToPage(i)}} >
                    {this.props.tabStyle==="greenBg"?
                        <View style={{backgroundColor: "#dbf9ef",borderRadius: 19}}>
                            <Text style={[styles.greenBg]}>{this.props.tabNames[i]}</Text>
                        </View>
                        :
                        <YFWTitleView type='tab' style_title={{fontSize:15,width:15*this.props.tabNames[i].length+15}} title={this.props.tabNames[i]}/>
                    }
                </TouchableOpacity>
            )

        } else {
            return(
                <TouchableOpacity key={i+'v'} style={[{width:this.props.width?this.props.width:kScreenWidth/5,height:45},BaseStyles.centerItem]} activeOpacity={1} onPress={()=>{this.props.goToPage(i)}} >
                    {this.props.tabStyle === "longName" ? <Text style = {{fontSize: 14, color: '#333'}} numberOfLines={1}>{this.props.tabNames[i]}</Text> :
                        <YFWTitleView type = 'tab' style_title = {{fontSize: 15, color: '#333'}}
                                      title = {this.props.tabNames[i]}
                                      hiddenBgImage = {this.props.activeTab != i} />
                    }
                </TouchableOpacity>
            )
        }
    }

    render() {

        return (
            <View style={{height:45,}}>
                <ScrollView
                    ref={scrollView => {
                        if(scrollView !== null){
                            if(this.props.activeTab>4){
                                setTimeout(()=>{
                                    scrollView.scrollTo({x:kScreenWidth/5,y:0,animated:true},1)
                                })
                            }else{
                                setTimeout(()=>{
                                    scrollView.scrollTo({x:0,y:0,animated:true},1) 
                                })
                            }
                        }
                    }}
                    style={{height:45}}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps={'always'}
                >
                    {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    greenBg:{
        paddingVertical: 3,
        paddingHorizontal: 10,
        fontSize:15,
        color:"#1fdb9b",
        fontWeight: "bold"},
});

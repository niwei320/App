/**
 * Created by 12345 on 2018/4/20.
 */
import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import {isEmpty} from '../Util/YFWPublicFunction'

export default class YFWListFooterComponent extends React.Component {

    static defaultProps = {
        showFoot: 0,
    }

    render() {
        if (this.props.showFoot === 1) {
            if (this.props.noFooterRender){
                return this.props.noFooterRender();
            } else {
                return (
                    <View style={styles.footer}>
                        <Text style={[{color:'#999999',fontSize: 13}]}>{isEmpty(this.props.from)?'没有更多了':'查看更多历史数据请搜索或至网页端查看'}</Text>
                    </View>
                );
            }
        } else if(this.props.showFoot === 2) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator />
                    <Text style={[BaseStyles.contentWordStyle]}>
                        正在加载更多数据...
                    </Text>
                </View>
            );
        }  else if(this.props.showFoot === 3) {
            return (
                <View style={[styles.footer,{marginTop:30}]}>
                    <ActivityIndicator />
                </View>
            );
        }  else if(this.props.showFoot === 0){
            return (
                <View style={styles.footer}>
                    <Text></Text>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    footer:{
        flexDirection:'row',
        height:40,
        justifyContent:'center',
        alignItems:'center',
    }
});
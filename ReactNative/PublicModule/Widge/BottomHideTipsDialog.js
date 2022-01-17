import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, DeviceEventEmitter, Modal, FlatList,
} from 'react-native';
import {kScreenHeight, kScreenWidth} from "../Util/YFWPublicFunction";


export default class BottomHideTipsDialog extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isVisible:false,
            pageX:0,
            pageY:0,
            data:[],
            callback:()=>{}
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {

        this.showMenu = DeviceEventEmitter.addListener('ShowBottomHideTips',(value)=>{
            this.showView(value)
        });
    }

    componentWillUnmount() {

        if (this.showMenu.isActive) {
            this.showMenu.remove();
        }
        this.setState = (state,callback)=>{
            return;
        };
    }

//-----------------------------------------------METHOD---------------------------------------------
    showView(value){

        this.setState({
            isVisible: true,
            pageX:value.pageX,
            pageY:value.pageY,
            data:value.data,
            callback:value.callback
        });

    }

    closeModal() {
        this.setState({
            isVisible: false
        });
    }

//-----------------------------------------------RENDER---------------------------------------------
    _renderItem(item){
        return (
            <TouchableOpacity hitSlop={{top:10,left:10,bottom:5,right:10}} onPress={()=>{this.state.callback && this.state.callback(item.item);this.closeModal()}}>
                <Text style={{minWidth:56,fontSize: 13, color: "#666666"}}>{item.item.text}</Text>
            </TouchableOpacity>
        )
    }
    render() {
        return (
            <Modal
                transparent={true}
                visible={this.state.isVisible}
                animationType={'fade'}
                onRequestClose={() => this.closeModal()}>
                <TouchableOpacity style={styles.container} activeOpacity={1} onPress={() => this.closeModal()}>
                    <View style={[styles.modal,{left:this.state.pageX,bottom:this.state.pageY}]}>
                        <FlatList
                            style={{paddingVertical: 13, paddingHorizontal: 12}}
                            data={this.state.data}
                            ItemSeparatorComponent={()=>( <View style={{width:48, height: 1,marginVertical:5, backgroundColor: "#eeeeee"}}/> )}
                            renderItem={this._renderItem.bind(this)}
                    />
                    </View>
                </TouchableOpacity>
            </Modal>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: kScreenWidth,
        height: kScreenHeight,
    },
    modal: {
        backgroundColor: 'white',
        position: 'absolute',
        left: 0,
        bottom: 0,
        justifyContent: 'center',
        opacity: 1,
        shadowColor: "rgba(0, 0, 0, 0.09)",
        shadowOffset: {
            width: 0,
            height: 9
        },
        elevation:2,
        shadowRadius: 22,
        shadowOpacity: 1,
        borderRadius: 3,
    },
});
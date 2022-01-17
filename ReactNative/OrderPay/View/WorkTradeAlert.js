import React, { Component } from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { kScreenWidth } from '../../PublicModule/Util/YFWPublicFunction';
import ModalView from '../../widget/ModalView';

export default class WorkTradeAlert extends Component {
    
    constructor(...args) {
        super(...args);
        this.state = {
            dataArray: [],
        };
    }



    showView( data,callback) {
        this.callback = callback
        this.setState({ dataArray: data }, () => { 
            this.modalView && this.modalView.show()
        })
    }


    closeView() {
      
        this.modalView && this.modalView.disMiss()
    }


    renderAlertView() {
        return (
            <View style={[{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
                <TouchableOpacity onPress={() => this.closeView()} style={{ flex: 1 }} />
                <View style={{ backgroundColor: 'white', flex: 1, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                    <Text style={{ fontSize: 16, color: '#333333', marginLeft: 16, marginTop: 20 }}>{'请选择从事行业'}</Text>
                    <FlatList
                        ref={(e) => this.listView = e}
                        data={this.state.dataArray}
                        renderItem={this._renderItem}
                        ItemSeparatorComponent={() => { return <View style={{width:kScreenWidth-30,marginLeft:15,height:1,backgroundColor:'rgb(191,191,191)'}}/>}}
                        style={{ flex: 1, paddingTop: 10 ,marginTop:20}}
                    />
                </View>
            </View>
        )
    }

    _renderItem = (item) => {
        var txt = item.item.name;
        let region_id = item.item.id;
        return (
            <TouchableOpacity activeOpacity={1} onPress={this.clickItem.bind(this,item.item)}>
                <View style={{justifyContent:'center',flex:1,height:40,backgroundColor:'white'}}>
                    <Text style={{color:'#666666', fontSize:15}}>{'     ' + txt}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    clickItem(item) {
        this.callback&&this.callback(item)
        this.closeView();
    }



    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                {this.renderAlertView()}
            </ModalView>
        );
    }
}

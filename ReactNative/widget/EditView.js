/**
 * Created by 12345 on 2018/4/20.
 */
import React, {Component} from 'react';
import {
    ToolbarAndroid,
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity
} from 'react-native';

export default class EditView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            text: ''
        };
    }

    render() {
        return (
            <View style={LoginStyles.TextInputView}>
                <TextInput style={LoginStyles.TextInput}
                           placeholder={this.props.name}
                           placeholderTextColor="#999999"
                           onChangeText={(text) => {
                           this.setState({text});
                           this.props.onChangeText(text);
           }
        }/></View>
        );
    }
}


const LoginStyles = StyleSheet.create({
    TextInputView: {
        marginTop: 10,
        height: 50,
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        flexDirection: 'column',
        justifyContent: 'center',
    },

    TextInput: {
        backgroundColor: '#ffffff',
        height: 45,
        margin: 18,
    },
});
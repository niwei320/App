import React from 'react'
import {
    Image,
    View,
} from 'react-native'

export default class ToTopImgButton extends React.Component {

    constructor(props) {
        super(props)
        this.img = this.props.img
    }

    render() {
        if(this.img == null){
            return;
        }
        return (
            <View>
                <Image style={{width:42,height:42}} source={this.img} />
            </View>
        )
    }

    _setImg(img){
        this.img=img;
        this.setState({})
    }
}
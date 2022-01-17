import React from 'react'
import {
    View,
    Image
} from 'react-native'

import {isEmpty} from '../PublicModule/Util/YFWPublicFunction'
export default class YFWImageView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            error:false
        }
    }

    render() {
        if (this.state.error) {
            return (<Image style={{width:this.props.width,height:this.props.height,resizeMode:this.props.resizeMode}} source={require('../../img/nopic.png')}/>)
        } else {
            if (isEmpty(this.props.source.uri)) {
                return (<Image style={{width:this.props.width,height:this.props.height,resizeMode:this.props.resizeMode}}
                               source={require('../../img/default_img.png')}/>)
            } else {
                return (<Image style={{width:this.props.width,height:this.props.height,resizeMode:this.props.resizeMode}}
                               source={this.props.source}
                               onError={()=>{this.setState({error:true})}}
                />)
            }
        }
    }
}

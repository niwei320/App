import React from 'react'
import {
    Image,
    TouchableOpacity,
    View,
    Text,WebView
} from 'react-native'
import {isAndroid} from "../../../PublicModule/Util/YFWPublicFunction";

/**
 * 查看大图
 */
export default class YFWStaticWebView extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            html_code:''
        }
    }

    static navigationOptions = ({ navigation }) => ({
        tabBarVisible: false,
        headerTitle:(
            <Text style={[{color:'black',fontSize:16,flex:1,textAlign:'center'}]} numberOfLines={1}>{navigation.state.params.state.title}</Text>
        )
    });


    componentDidMount() {
        this.state.html_code = this.props.navigation.state.params.state.value
        this.setState({})
    }


    render() {
        var htmlContent=`<!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
            </head>
            <body  content="initial-scale=1.0, maximum-scale=1.0" >
                ${this.state.html_code}
                <script>
                    window.onload=function(){
                        window.location.hash = 1;
                        document.title = document.body.clientHeight;
                    }
                </script>
            </body>
        </html>`;
        return (
            <WebView
                bounces={false}
                source={{ html: htmlContent}}
                scalesPageToFit={isAndroid()}
                automaticallyAdjustContentInsets={false}
                scrollEnabled={true}
            />
        )
    }
}

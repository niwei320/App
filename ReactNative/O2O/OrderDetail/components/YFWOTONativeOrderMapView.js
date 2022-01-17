import {
    requireNativeComponent,
    Platform,
    UIManager,
    findNodeHandle,
    NativeModules
} from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';
import {isAndroid, kScreenWidth} from "../../../PublicModule/Util/YFWPublicFunction";
class YFWOTONativeOrderMapView extends React.Component{
    static defaultProps = {
        style:{},
        dataArray:[],
        onClick:()=>{},
        onTimeOut:()=>{}
    }
    static propTypes = {
        style:PropTypes.object,
        dataArray:PropTypes.array,
        onClick:PropTypes.func,
        onTimeOut:PropTypes.func
    }

    componentWillUnmount() {
        if(isAndroid()){
            UIManager.dispatchViewManagerCommand(
                findNodeHandle(this.mapView),
                10001,
                []
            );
        }
    }

    mapViewWillAppear() {
        if(Platform.OS==='ios'){
            UIManager.dispatchViewManagerCommand(
                findNodeHandle(this),
                UIManager.YFWRNMapView.Commands.mapViewWillAppear,
                null
            )
        }
    }

    mapViewFocus() {
        if(isAndroid()){
            UIManager.dispatchViewManagerCommand(
                findNodeHandle(this.mapView),
                10003,
                []
            );
        }
    }

    mapViewBlur() {
        if(isAndroid()){
            UIManager.dispatchViewManagerCommand(
                findNodeHandle(this.mapView),
                10002,
                []
            );
        }

    }

    mapViewWillDisappear() {
        if(Platform.OS==='ios'){
            UIManager.dispatchViewManagerCommand(
                findNodeHandle(this),
                UIManager.YFWRNMapView.Commands.mapViewWillDisappear,
                null
            )
        }
    }

    render() {
        return <YFWRNOrderMapView{...this.props} ref={(e)=>{this.mapView = e}} />
    }
}

var YFWRNOrderMapView = isAndroid()?
    requireNativeComponent('MapDeliveryView', YFWOTONativeOrderMapView)
    :requireNativeComponent('YFWRNOrderMapView', YFWOTONativeOrderMapView);
export default YFWOTONativeOrderMapView;

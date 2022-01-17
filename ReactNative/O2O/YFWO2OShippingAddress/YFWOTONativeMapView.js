import {
    requireNativeComponent,
    Platform,
    UIManager,
    findNodeHandle,
} from 'react-native';
import React from 'react';
import {isAndroid} from "../../PublicModule/Util/YFWPublicFunction";

let YFWRNMapView = isAndroid()?
    requireNativeComponent( 'MapNearbyPoiView')
    :
    requireNativeComponent('YFWRNMapView', YFWOTONativeMapView)

class YFWOTONativeMapView extends React.Component{


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
        return <YFWRNMapView {...this.props} ref={(e)=>{this.mapView = e}} />
    }
}

export default YFWOTONativeMapView;

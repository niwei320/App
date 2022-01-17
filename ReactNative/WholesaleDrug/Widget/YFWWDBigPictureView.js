import React from 'react'
import {
    Image,
    TouchableOpacity,
    View,
    Text
} from 'react-native'
import {
    iphoneBottomMargin,
    iphoneTopMargin,
    isNotEmpty,
    kScreenHeight,
    kScreenWidth, tcpImage, changeImageUrlHeader
} from "../../PublicModule/Util/YFWPublicFunction";
import {darkLightColor} from "../../Utils/YFWColor";
import {BaseStyles} from "../../Utils/YFWBaseCssStyle";
import ImageViewer from 'react-native-image-zoom-viewer';
import ModalView from '../../widget/ModalView';
/**
 * 查看大图
 */
export default class YFWWDBigPictureView extends React.Component {

    constructor(props) {
        super(props)
        this.imgs = []
        this.currentIndex = 0
        this.count = 0
        this.hiddenIndicator = false
    }

    showView(array, index, hidden) {
        this.imgs = array
        this.currentIndex = index
        this.count = array.length
        this.hiddenIndicator = hidden
        this.setState({}, () => { 
            this.modalView && this.modalView.show()
        })
    }


    closeView(){
        this.modalView && this.modalView.disMiss()
    }


    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade" style={{backgroundColor:'white'}}>
                    {
                        this.hiddenIndicator?
                        <ImageViewer
                            style={{width:kScreenWidth,height:kScreenHeight}}
                            imageUrls={this.imgs}
                            index={this.currentIndex}
                            backgroundColor={'rgba(0,0,0,0.4)'}
                            saveToLocalByLongPress={false}
                            onChange={(index)=>{
                                this.currentIndex = index
                                this.setState({})
                            }}
                            onClick={()=>{
                                this.closeView()
                            }}
                            renderIndicator={()=>{return null}}
                        />:
                        <ImageViewer
                            style={{width:kScreenWidth,height:kScreenHeight}}
                            imageUrls={this.imgs}
                            index={this.currentIndex}
                            backgroundColor={'rgba(0,0,0,0.4)'}
                            saveToLocalByLongPress={false}
                            onChange={(index)=>{
                                this.currentIndex = index
                                this.setState({})
                            }}
                            onClick={()=>{
                                this.closeView()
                            }}
                        />
                    }
                    {
                        this.hiddenIndicator?null:
                        <View style={[BaseStyles.centerItem,
                            {position:'absolute',right:10,bottom:50+iphoneBottomMargin() ,width:50,height:50,borderRadius:25,backgroundColor:darkLightColor()}]}>
                            <Text style={{fontSize:12,color:'white'}}>{this.currentIndex+1+'/'+this.count}</Text>
                        </View>
                    }
            </ModalView>
        )
    }
}

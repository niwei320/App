import React,{Component} from 'react'
import {View,Text,TouchableOpacity,Image,ImageBackground} from 'react-native'
import YFWTextMarqueeView from '../../../widget/YFWTextMarqueeView';
import { kScreenScaling, isNotEmpty, adaptSize } from '../../../PublicModule/Util/YFWPublicFunction';
import { YFWImageConst } from '../../Images/YFWImageConst';
import { pushWDNavigation } from '../../YFWWDJumpRouting';

export default class YFWWDHomeMarketRoom extends Component {
    constructor(args){
        super(args)
        this.moreInfo = null
        this.showSelf = true
    }

    static defaultProps= {
        Data:[]
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.Data) {
            nextProps.Data.map((item)=>{
                if (item.name == '药师讲堂') {
                    this.moreInfo = item           
                }
            })
        }
    }

    render() {

        let texts = []
        this.props.Data&&this.props.Data.map((item)=>{
            if (item.name != '药师讲堂') {
                texts.push(item.name)                
            }
        })
        if (this.showSelf&&texts.length>0) {
            return (
                <View style={{ flex: 1 }}>
                    <View style={{ backgroundColor: 'white', marginHorizontal: 13, marginTop: 10, height: adaptSize(30), borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Image style={{ width: 12, height: 12, marginLeft: 10 }} source={YFWImageConst.Market_icon_voice}></Image>
                        <Image style={{ width: 59, height: 16, marginLeft: 5 }} source={YFWImageConst.Market_icon_tip}></Image>
                        <YFWTextMarqueeView bgViewStyle={{ flex: 1 }} textStyle={{ marginLeft: 15, fontSize: 13, color: '#333' }} textsArray={texts} callBack={(index) => this.clickedAction(index)}></YFWTextMarqueeView>
                        <TouchableOpacity style={{ paddingLeft: 17, paddingRight: 10, flexDirection: 'row', alignItems: 'center' }} touchableOpacity={1} onPress={() => this.showMoreAction()}>
                            <Image style={{ width: 10, height: 10, marginLeft: 3, tintColor: '#666' }} source={YFWImageConst.Icon_close}></Image>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 11, backgroundColor: '#ccc', opacity: 0.1 }}></View>
                </View>
            )
        } else {
            return null
        }
    }

    showMoreAction(){ 
        this.showSelf = false
        this.setState({})
    }

    clickedAction(index){
        let info = this.props.Data[index]
        const {navigate} = this.props.navigation
        pushWDNavigation(navigate,info)
    }

}
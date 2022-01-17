import React, {Component} from 'react';
import {
    View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, FlatList
} from 'react-native';
import YFWHeaderLeft from "../Widget/YFWHeaderLeft";
import {
    adaptSize,
    darkStatusBar,
    isIphoneX,
    kScreenWidth
} from "../../PublicModule/Util/YFWPublicFunction";
import YFWWDShopCarEmptyView from "../ShopCar/View/YFWWDShopCarEmptyView";
import LinearGradient from "react-native-linear-gradient";
import {YFWImageConst} from "../Images/YFWImageConst";
import {
    kRoute_probate_admin,
    kRoute_probate_qualify,
    kRoute_probate_store, kRoute_probate_treatment,
    pushWDNavigation, replaceWDNavigation
} from "../YFWWDJumpRouting";

export default class YFWWDUploadDocumentsGuideView extends Component {
    static navigationOptions = ({navigation}) => ({
        tabBarVisible: false,
        headerTitle: '资质上传引导',
        headerRight: <YFWHeaderLeft navigation={navigation} />
    });

    constructor(props) {
        super(props);
        this.state = {
            badge: this.props.navigation.state.params.state.badge,
            guideArray_Doc: [
                {
                    text: '1.请拍摄正本复印件（需加盖公章）',
                    image:YFWImageConst.image_guideArray_Doc_1,
                },
                {
                    text: '2.将手机处于正上方或正前方拍摄，确保页面四角完整，字迹清晰，亮度均匀。',
                    image:YFWImageConst.image_guideArray_Doc_2,
                },
                {
                    text: '3.检查证件照片方向是否正确。',
                    image:YFWImageConst.image_guideArray_Doc_3,
                },
                {
                    text: '4.请确保证件在有效期内，并按照证件上的资料如实填写。',
                    image:YFWImageConst.image_guideArray_Doc_4,
                },
            ],
            guideArray_ID: [
                {
                    text: '1.请拍摄身份证原件或复印件（复印件需加盖公章）',
                    image:YFWImageConst.image_guideArray_ID_1,
                },
                {
                    text: '2.将手机处于正上方或正前方拍摄。确保身份证处于照片中央区域，字迹清晰，亮度均匀。',
                    image:YFWImageConst.image_guideArray_ID_2,
                },
            ],
        }
    }

//----------------------------------------------LIFECYCLE-------------------------------------------

    componentWillMount() {

    }

    componentDidMount() {
        darkStatusBar()
    }

    componentWillUnmount() {

    }

//-----------------------------------------------METHOD---------------------------------------------

    onClicked(){
        let {badge} = this.state
        replaceWDNavigation(this.props.navigation, badge)
    }

//-----------------------------------------------RENDER---------------------------------------------
    _renderListHeaderComponent(){
        return (
            <View style={{width: kScreenWidth, paddingVertical:18, alignItems: 'center',}}>
                <View style={{flexDirection:'row', alignItems: 'center'}}>
                    <View style={{width: 4, height: 16, backgroundColor: "#547cff", paddingLeft:6}}/>
                    <Text style={{fontWeight: "bold", fontSize: 16, color: "#333333"}}>证照要求</Text>
                </View>
            </View>
        );
    }

    _renderListFooterComponent(){
        return (
            <View style={{ height: 77, width: kScreenWidth, paddingHorizontal: 36}}>
                <LinearGradient style={{height:42,borderRadius:21}} colors={['rgb(50,87,234)', 'rgb(51,105,255)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 1]}>
                    <TouchableOpacity style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} activeOpacity={1} onPress={() => this.onClicked()}>
                        <Text style={{ fontSize: 17, color: 'white', fontWeight: 'bold' }}>{'立即上传'}</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        )
    }

    _renderItem(item) {
        let {text} = item.item
        let {image} = item.item
        return (
            <View style={{paddingHorizontal:27,paddingBottom:34, alignItems: 'center',}}>
                <View style={{width:kScreenWidth-82, marginBottom:13}}>
                    <Text style={{fontSize: 14, fontWeight:'bold', color: "#333333"}}>{text}</Text>
                </View>
                <Image
                    resizeMethod={'resize'}
                    source={image}
                    style={{width:kScreenWidth-72,height:(kScreenWidth-72)/302*206,resizeMode:'contain'}}
                />
            </View>
        )
    }

    render() {
        let {type} = this.state.badge
        let guideArray = type === kRoute_probate_admin?this.state.guideArray_ID:this.state.guideArray_Doc
        return (
            <View style = {[style.center, {flex: 1}]}>
                <View style={{width: kScreenWidth, paddingVertical:8, paddingHorizontal:16, backgroundColor: "#ffede1"}}>
                    <Text style={{fontSize: 12, color: "#feac4c"}}>为了保证资质上传质量，请仔细阅读！</Text>
                </View>
                <FlatList
                    data={guideArray}
                    keyExtractor={(item,index)=>index+""}
                    renderItem={this._renderItem.bind(this)}
                    ListHeaderComponent={this._renderListHeaderComponent()}
                    ListFooterComponent={this._renderListFooterComponent()}
                />
            </View>
        )
    }
}

const style = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});

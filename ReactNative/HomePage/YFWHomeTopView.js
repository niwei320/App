import React,{Component} from 'react'
import {View,Text,TouchableOpacity,ScrollView,DeviceEventEmitter} from 'react-native'
import YFWTitleView from '../PublicModule/Widge/YFWTitleView';
import { iphoneTopMargin, safeArray } from '../PublicModule/Util/YFWPublicFunction';
import {backGroundColor} from '../Utils/YFWColor'
export default class YFWHomeTopView extends Component {
    constructor(args){
        super(args)
        this.state = {
            index:this.props.index
        }
    }

    static defaultProps = {
        Data:[],
        index:0
    }

    componentDidMount(){
        DeviceEventEmitter.addListener('homeTopIndexChange',(index)=>{
            this.setState({index:index})
        })
    }

    componentWillUnmount(){

    }

    render(){
        let views = []
        safeArray(this.props.Data).map((item,index)=>{
            let isUnselect =  this.state.index != index
            views.push(
                <TouchableOpacity key={index+'topTitle'} style={{marginHorizontal:7}} activeOpacity={1}  onPress={()=>{this.clickedIndex(index)}} >
                    <YFWTitleView type='tab' style_title={{fontSize:15,fontWeight:'500',width:80}} title={item.name} hiddenBgImage={isUnselect}/>
                </TouchableOpacity>
            )
        })
        let allButton = []
        for (let index = 0; index < 4; index++) {
            allButton.push(
                <TouchableOpacity key={index+'top'} style={{flex:1}} activeOpacity={1} onPress={()=>{this.clickedAction(index)}}/>
            )
        }

        return(
            <View>
                {this.props.from=='health_my'||this.props.isShopMember?<View/>:<View style={{height:30+iphoneTopMargin()}}>
                    <View style={{height:iphoneTopMargin(),flexDirection:'row'}}>
                        {allButton}
                    </View>
                </View>}
                <ScrollView style={[{height:45,backgroundColor:this.props.from=='health_my'?'white':backGroundColor()}]}
                        keyboardShouldPersistTaps={'always'}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{alignItems:'center',marginHorizontal:6}} >
                    {views}
                </ScrollView>
            </View>
        );
    }

    clickedAction(index){
        DeviceEventEmitter.emit('kFindCodeClicked',index)
    }

    clickedIndex(index) {
        if (this.state.index == index) {
            return
        }
        this.setState({
            index:index
        })
        this.props.clickedIndex(index)
    }
}
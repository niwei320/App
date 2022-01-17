import React from 'react'
import {
    View,
    TouchableOpacity,
    ImageBackground,
    Text,
    Image,
    Dimensions,
    DeviceEventEmitter
} from 'react-native'
const width = Dimensions.get('window').width;
import YFWRequestViewModel from '../../Utils/YFWRequestViewModel'
import {pushNavigation} from '../../Utils/YFWJumpRouting'
import {separatorColor,darkNomalColor,darkLightColor,darkTextColor,backGroundColor} from '../../Utils/YFWColor'
import YFWUserInfoManager from "../../Utils/YFWUserInfoManager";
import {imageJoinURL, tcpImage, safeObj} from "../../PublicModule/Util/YFWPublicFunction";
export default class DrugRemidingItemView extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            value:false,
            switchImg:require('../../../img/switch_off.png'),
        }
    }

    _changeDrugStatus(value,id) {

        let paramMap = new Map();
        paramMap.set('__cmd', 'guest.common.app.openUseMedicineById');
        paramMap.set('isOpen', value?1:0);
        paramMap.set('remindId', id);
        let viewModel = new YFWRequestViewModel();
        viewModel.TCPRequest(paramMap, (res)=> {
            DeviceEventEmitter.emit('changeDrugRemind')
            if(res.code == 1){

                if (value){

                    this.setState({
                        value:true,
                        switchImg: require('../../../img/switch_on.png')
                    });

                } else {

                    this.setState({
                        value:false,
                        switchImg: require('../../../img/switch_off.png')
                    });

                }


            }else{
                this.setState({
                    value:false,
                    switchImg: require('../../../img/switch_off.png')
                });
            }
        },(error)=>{
            this.setState({
                value:false,
                switchImg: require('../../../img/switch_off.png')
            });
        },true)

    }

    componentDidMount() {
        this.setState({
            value:parseInt(this.props.data.enable)==1?true:false,
            switchImg: parseInt(this.props.data.enable)==1?require('../../../img/switch_on.png'):require('../../../img/switch_off.png'),
        })
    }
    componentWillReceiveProps(newProps,oldProps) {
        if (safeObj(newProps.data).enable != safeObj(oldProps.data).enable) {
            this.setState({
                value:parseInt(newProps.data.enable)==1?true:false,
                switchImg: parseInt(newProps.data.enable)==1?require('../../../img/switch_on.png'):require('../../../img/switch_off.png'),
            })
        }
    }
    clickItem(id) {
        let {navigate} = this.props.navigation;
        pushNavigation(navigate, {type: 'drug_remidingdetail', value:id,action:'update'})
    }

    switchView(){

    }

    render() {

        let image_url = imageJoinURL(this.props.data.image_url);
        if (image_url.includes('medicine') && !image_url.includes('300x300')){
            image_url = tcpImage(image_url);
        }

        return (
            <TouchableOpacity activeOpacity={1} onPress={()=> this.clickItem(this.props.data.id)}>
                <View style={{ flexDirection:'row',backgroundColor:'#FFF',flex:1,padding:15}}>
                    <ImageBackground style={{width:80,height:80}} source={require('../../../img/default_img.png')}>
                        <Image style={{width:80,height:80,resizeMode:'stretch'}}
                               source={{uri:image_url}}>
                        </Image>
                    </ImageBackground>
                    <View>
                        <Text numberOfLines={1} style={{color:darkTextColor(),fontSize:14,marginLeft:15,marginTop:15,width:width-125}}>{this.props.data.name_cn}</Text>
                        <View style={{marginLeft:15,marginTop:15,alignItems:'center',flexDirection:'row',width:width-75}}>
                            <View style={{flex:1}}><Text style={{color:darkLightColor(),fontSize:12,flex:5}} numberOfLines={2}>{this.props.data.desc}</Text></View>
                            <View style={{width:100,height:40}}>
                                <TouchableOpacity activeOpacity={1} onPress={()=>this._changeDrugStatus(!this.state.value,this.props.data.id)}>
                                    <Image style={{width:55,height:25,resizeMode:'contain'}} source={this.state.switchImg}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{height:1,width:width,backgroundColor:'#E5E5E5',marginLeft:10}}/>
            </TouchableOpacity>
        )
    }
}

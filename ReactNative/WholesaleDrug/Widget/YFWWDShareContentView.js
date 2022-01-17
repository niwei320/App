import React from 'react'
import {
    View,
    Dimensions,
    Image,
    Text
} from 'react-native'

const {width, height} = Dimensions.get('window');
import {backGroundColor, darkLightColor, darkNomalColor, darkTextColor, yfwOrangeColor} from '../../Utils/YFWColor'
import {kScreenWidth, safeObj, tcpImage} from "../../PublicModule/Util/YFWPublicFunction";
import {toDecimal} from "../../Utils/ConvertUtils";
import { YFWImageConst } from '../Images/YFWImageConst';
export default class YFWWDShareContentView extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
      const imgUrl = tcpImage(safeObj(safeObj(safeObj(this.props.shareData).img_url)[0])) || ''
      const imageSource = imgUrl.length>0 ? {uri: imgUrl} : YFWImageConst.Share_default
      let content = ''
      if (this.props.data.page == 'detail') {
        content = this.props.data.standard+'('+this.props.data.manfacturer+')'
      } else if (this.props.data.page == 'usercenter') {
        content = this.props.data.content
      } else if (this.props.data.page == 'shop') {
        content = '在售品种：'+(this.props.shareData?.storeGoodsNum || 0)+'种'
      }
      return (
        <View>
          <View
              style={{backgroundColor:'#FFFFFF',marginLeft:20,marginRight:20,marginTop:15, paddingVertical: 10, alignItems:'center'}}>
              <Image style={{width:width-180,height:width-180}}
                    source={imageSource}>
              </Image>
              <Text style={{color:'#666666',fontSize:13, marginHorizontal: 10, marginTop: 10}}>{this.props.data.title}</Text>
              <Text style={{color:'#666666',fontSize:10,marginTop:10}}>{content}</Text>
              {/* {this.props.data.page == 'detail' && <Text style={{color:yfwOrangeColor(),fontSize:13,marginTop:10}}>¥ {toDecimal(this.props.shareData.price)}</Text>} */}
          </View>
      </View>
      )
    }

}
